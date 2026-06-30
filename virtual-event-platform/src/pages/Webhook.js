// Function to send messages directly to Discord
const axios = require('axios');

// Replace this with your actual webhook URL from Discord
const discord_webhook_api = 'https://discord.com/api/webhooks/1360303341258936330/XPodfM2qz2httL0z2LElI1lKkR90nlXLiU6WOl_Xh1uT1zoEfWkFQVmNF7f-iMAWg4kV';

// List of events with times in the format ["webinar", "HH:MM"]
const events = [
  // Webinars
  { event: "webinar : React - Building Performant React Apps with Hooks", time: "23:46" },
  { event: "webinar : Node.js - Creating Scalable APIs with Express & Node", time: "23:47" },
  { event: "webinar : Docker - Intro to Docker: Simplify DevOps", time: "23:48" },
  { event: "webinar : MongoDB - Data Modeling and Aggregation Made Easy", time: "23:49" },
  { event: "webinar : Firebase - Real-time Web Apps with Firebase Firestore", time: "23:50" },

  // Conferences
  { event: "conference : AI/ML - AI Frontiers Summit 2025", time: "23:51" },
  { event: "conference : Cybersecurity - DEFCON Linux Security Conference", time: "23:52" },
  { event: "conference : Flutter - Flutter Forward - Cross-Platform UI in 2025", time: "23:53" },
  { event: "conference : Cloud - Google Cloud Next", time: "23:54" },
  { event: "conference : TypeScript - TSConf - Scaling Apps with TypeScript", time: "23:55" },

  // Meetups
  { event: "meetup : JavaScript - JavaScript Night: Async Patterns & Promises", time: "23:56" },
  { event: "meetup : Python - Python for AI Enthusiasts - Code & Coffee", time: "23:57" },
  { event: "meetup : DevOps - CI/CD in Action with GitHub Actions", time: "23:58" },
  { event: "meetup : Linux - ParrotOS + Kali: Ethical Hacking Essentials", time: "13:43" },
  { event: "meetup : Web3 - Web3 Builders Meetup - Ethereum DApp Showcase", time: "13:42" }
];


// Function to send messages directly to Discord
async function sendMessage(event) {
  const messagePayload = {
    content: event.event || 'default',
  };

  console.log('Sending message:', messagePayload); // Log the message being sent

  try {
    const response = await axios.post(discord_webhook_api, messagePayload);

    if (response.status === 204) {
      console.log('Message sent successfully:', event.event);
    } else {
      console.log('Failed to send message:', response.data);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Function to calculate delay and schedule the message
function scheduleMessages() {
  const now = new Date();
  
  events.forEach(event => {
    // Parse the event time (format: "HH:MM")
    const [hours, minutes] = event.time.split(":").map(num => parseInt(num));

    // Get today's date and set the event time
    const eventTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    
    // If the event time is in the future, schedule it, else skip it
    if (eventTime > now) {
      const timeDiff = eventTime - now; // Time difference in milliseconds

      console.log(`Scheduling "${event.event}" at ${event.time}, which is in ${timeDiff / 1000} seconds`);

      // Set a timeout to send the message when the event time comes
      setTimeout(() => sendMessage(event), timeDiff);
    } else {
      console.log(`Skipping "${event.event}" as it's scheduled for the past.`);
    }
  });
}

// Call the function to schedule messages
scheduleMessages();
