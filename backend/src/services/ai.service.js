'use strict';

const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const config = require('../config/index');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Initialize Gemini client if API key is provided
let genAI = null;
if (config.gemini.apiKey) {
  genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  logger.info('Gemini AI client initialized successfully.');
} else {
  logger.warn(
    'GEMINI_API_KEY is not configured. Intelligence routes will return a configuration warning.'
  );
}

/**
 * Ensures Gemini is properly configured before running actions.
 * @private
 */
const _ensureConfigured = () => {
  if (!genAI) {
    throw new AppError(
      'Gemini AI Integration is not configured. Please set GEMINI_API_KEY in the environment.',
      503,
      'AI_NOT_CONFIGURED'
    );
  }
};

/**
 * Event schema structure for structured output parsing.
 */
const eventExtractionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    eventName: {
      type: SchemaType.STRING,
      description: 'The title of the event.',
    },
    description: {
      type: SchemaType.STRING,
      description: 'A detailed marketing description of what the event is about.',
    },
    type: {
      type: SchemaType.STRING,
      enum: ['Webinar', 'Conference', 'Meetup', 'Workshop', 'Other'],
      description: 'The format of the event.',
    },
    mode: {
      type: SchemaType.STRING,
      enum: ['Online', 'Offline', 'Hybrid'],
      description: 'Whether it is online, in-person (offline), or mixed.',
    },
    category: {
      type: SchemaType.STRING,
      description: 'The core topic category (e.g. Technology, Finance, Education, Health).',
    },
    language: {
      type: SchemaType.STRING,
      description: 'The primary language of the event (e.g. English, Hindi, Marathi).',
    },
    startDate: {
      type: SchemaType.STRING,
      description: 'The starting date and time in ISO format (YYYY-MM-DDTHH:MM). Suggest a reasonable future date relative to today if none specified.',
    },
    endDate: {
      type: SchemaType.STRING,
      description: 'The ending date and time in ISO format. Must be after startDate.',
    },
    meetingPlatform: {
      type: SchemaType.STRING,
      enum: ['Google Meet', 'Jitsi', 'Zoom', 'Teams', 'Other'],
      description: 'Platform name if the event mode is Online or Hybrid.',
    },
    venueName: {
      type: SchemaType.STRING,
      description: 'Venue or building name if the event mode is Offline or Hybrid.',
    },
    venueAddress: {
      type: SchemaType.STRING,
      description: 'Full address of the venue if Offline or Hybrid.',
    },
    googleMapLink: {
      type: SchemaType.STRING,
      description: 'Google Maps link for the venue if Offline or Hybrid.',
    },
    ticketType: {
      type: SchemaType.STRING,
      enum: ['Free', 'Paid'],
      description: 'Whether tickets are free or paid.',
    },
    ticketPrice: {
      type: SchemaType.NUMBER,
      description: 'Price of the ticket in INR. Must be 0 if free.',
    },
    attendeeLimit: {
      type: SchemaType.NUMBER,
      description: 'Maximum seating capacity or attendee cap.',
    },
  },
  required: ['eventName', 'type', 'mode', 'startDate', 'endDate', 'ticketType'],
};

const AIService = {
  /**
   * Drafts an event configuration from a natural language prompt.
   * @param {string} prompt - User description (e.g. "React coding boot camp next Friday in Pune")
   * @returns {Promise<object>} Extracted schema-compliant event configuration
   */
  draftEvent: async (prompt) => {
    _ensureConfigured();

    const todayStr = new Date().toISOString().split('T')[0];
    const systemInstruction = `You are an expert event coordinator assistant. Extract and refine the details of the event described by the user. 
Today's reference date is ${todayStr}. If dates are relative (e.g. "next Friday"), calculate them exactly relative to today's date.
Fill in reasonable creative values for description, category, and language if not explicitly provided, matching the tone.
Ensure output conforms strictly to the specified JSON schema structure.`;

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction,
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: eventExtractionSchema,
          temperature: 0.1, // Low temp for extraction consistency
        },
      });

      const responseText = result.response.text();
      return JSON.parse(responseText);
    } catch (error) {
      logger.error(`AI draftEvent error: ${error.message}`);
      throw new AppError(
        `Failed to parse event description: ${error.message}`,
        422,
        'AI_EXTRACTION_FAILED'
      );
    }
  },

  /**
   * Conversational assistant for attendee Q&A about an event.
   * @param {object} event - Mongoose event document
   * @param {string} question - User inquiry
   * @param {Array<object>} [history] - Previous chat messages
   */
  answerAttendeeQuestion: async (event, question, history = []) => {
    _ensureConfigured();

    const eventDetailsText = JSON.stringify(event, null, 2);
    const systemInstruction = `You are a helpful, professional AI host for the event named "${event.eventName}". 
You answer questions for registered or prospective attendees using ONLY the event details provided below.
If a question cannot be answered using the details (e.g., questions about topics not mentioned or external details), reply politely stating that you do not have that information and suggest contacting the organizer.

Event Context details:
${eventDetailsText}`;

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction,
      });

      // Map history to standard Gemini chat format
      const contents = history.map((h) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }));

      contents.push({ role: 'user', parts: [{ text: question }] });

      const result = await model.generateContent({ contents });
      return result.response.text();
    } catch (error) {
      logger.error(`AI attendee question error: ${error.message}`);
      throw new AppError(
        'The support agent was unable to answer your query right now.',
        500,
        'AI_CHAT_FAILED'
      );
    }
  },

  /**
   * Suggests an optimized session timetable based on topics and constraints.
   * @param {Array<string>} topics - List of sessions/topics
   * @param {object} constraints - Duration, tracks, timing details
   */
  optimizeSchedule: async (topics, constraints) => {
    _ensureConfigured();

    const prompt = `Arrange these sessions into an optimized timeline track schema:
Sessions: ${JSON.stringify(topics)}
Constraints: ${JSON.stringify(constraints)}`;

    const schema = {
      type: SchemaType.OBJECT,
      properties: {
        tracks: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              trackName: { type: SchemaType.STRING },
              slots: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    time: { type: SchemaType.STRING, description: "e.g., '09:00 AM - 10:30 AM'" },
                    sessionTitle: { type: SchemaType.STRING },
                    speaker: { type: SchemaType.STRING },
                  },
                  required: ['time', 'sessionTitle'],
                },
              },
            },
            required: ['trackName', 'slots'],
          },
        },
      },
      required: ['tracks'],
    };

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction:
          'You are a conference planner bot. Resolve timing conflicts, arrange sessions sequentially, and output a structured timeline matching the schema.',
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.2,
        },
      });

      return JSON.parse(result.response.text());
    } catch (error) {
      logger.error(`AI optimizeSchedule error: ${error.message}`);
      throw new AppError(
        'Failed to generate schedule proposal: ' + error.message,
        422,
        'AI_SCHEDULING_FAILED'
      );
    }
  },

  /**
   * Generates conversational business insights from compiled stats.
   * @param {object} stats - Organizer metrics summary
   * @param {string} query - User question
   */
  generateInsights: async (stats, query) => {
    _ensureConfigured();

    const systemInstruction = `You are a Principal Event Operations Analyst. You analyze an event organizer's metrics summary and answer their natural language questions.
Focus on operational efficiency, attendee conversion rates, and revenue opportunities. Always conclude with exactly 2 bold bullet-point suggestions.
Output the analysis in clean, professional markdown format.

Organizer Metrics Summary:
${JSON.stringify(stats, null, 2)}`;

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction,
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: query }] }],
      });

      return result.response.text();
    } catch (error) {
      logger.error(`AI generateInsights error: ${error.message}`);
      throw new AppError(
        'Failed to compile conversational insights: ' + error.message,
        500,
        'AI_INSIGHTS_FAILED'
      );
    }
  },

  /**
   * Conversational assistant for platform guidance.
   * @param {string} question - User question
   * @param {Array<object>} [history] - Previous chat messages
   */
  guidePlatformUser: async (question, history = []) => {
    _ensureConfigured();

    const todayStr = new Date().toISOString().split('T')[0];
    const systemInstruction = `You are "Eventify Guide Bot", a friendly, highly intelligent AI guide for the Eventify platform.
Your job is to guide users on how to navigate the platform, how to create events manually or with the AI Co-Creator, how virtual workspaces (Jitsi Meet) are automatically generated for online/hybrid events, how tickets are stored in the tickets wallet, and how standard payments work.

CRITICAL FEATURE - DIRECT EVENT CREATION:
If the user asks you to create, draft, schedule, host, or set up an event (e.g. "Create a workshop about python next week", "Schedule a meetup..."), you MUST output a JSON event object enclosed strictly between <CREATE_EVENT> and </CREATE_EVENT> tags. Do not output any other conversational text or markdown in that case.
Today's reference date is ${todayStr}. Calculate relative dates (e.g. "next Friday") relative to today.

Event Schema inside <CREATE_EVENT> tags:
{
  "eventName": "Short title",
  "description": "Engaging description",
  "type": "Webinar", // or "Conference", "Meetup", "Workshop", "Other"
  "mode": "Online", // or "Offline", "Hybrid"
  "category": "Technology", // or other appropriate category
  "startDate": "YYYY-MM-DDTHH:MM",
  "endDate": "YYYY-MM-DDTHH:MM", // must be after startDate
  "ticketType": "Free", // or "Paid"
  "ticketPrice": 0, // must be 0 if Free
  "attendeeLimit": 100,
  "meetingPlatform": "Jitsi" // if Online or Hybrid
}

Key Platform Info:
1. Navigation:
   - Dashboard: Overview of registrations, organized events, and analytics/insights.
   - Events (Discover): List all upcoming events, search, sort, and pagination.
   - Conferences & Meetups: Custom event listings filtered by format.
   - Tickets: The attendee wallet where purchased event tickets are stored.
   - AI Copilot: An AI prompt interface to automatically generate event templates.
   - Notifications Center: Real-time user feed for registrations and virtual meetings.
2. Integrations:
   - Jitsi Meet: Auto-provisioned room iframe for online events, restricted to registered users or organizers.
   - Razorpay payments: Prefills standard payment details for domestic transactions.
3. Guidelines:
   - To register for a Paid event, click "Pay & Book Ticket". The platform prevents double-bookings.
   - To launch a virtual session, click "Launch Jitsi Session" or the "Launch Meeting" button (unlocked upon successful registration).

Answer the user's question clearly, concisely, and supportively. Use Markdown format if helpful. Do NOT mention any internal developer testing details, mock sandbox bypasses, or testing UPI IDs (like success@razorpay).`;

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction,
      });

      // Map history to standard Gemini chat format
      const contents = history.map((h) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }));

      contents.push({ role: 'user', parts: [{ text: question }] });

      const result = await model.generateContent({ contents });
      return result.response.text();
    } catch (error) {
      logger.error(`AI platform guide error: ${error.message}`);
      throw new AppError(
        'The platform assistant is temporarily unavailable.',
        500,
        'AI_GUIDE_FAILED'
      );
    }
  },
};

module.exports = AIService;
