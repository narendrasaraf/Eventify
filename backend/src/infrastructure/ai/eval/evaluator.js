'use strict';

const path = require('path');
const fs = require('fs');
// Load environment variables if run standalone
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const AIGateway = require('../gateway/index');
const CostTracker = require('../middleware/cost.tracker');
const logger = require('../../../utils/logger');

// Define test scenarios for evaluation
const testScenarios = [
  {
    name: 'Event Ingestion Parsing',
    type: 'structured',
    prompt: 'Create a workshop about advanced React on July 10th in Pune, price 500 INR, limit 80 seats.',
    schema: {
      type: 'object',
      properties: {
        eventName: { type: 'string' },
        ticketPrice: { type: 'number' },
        attendeeLimit: { type: 'number' },
      },
      required: ['eventName', 'ticketPrice', 'attendeeLimit'],
    },
    validator: (data) => {
      return (
        data.eventName.toLowerCase().includes('react') &&
        data.ticketPrice === 500 &&
        data.attendeeLimit === 80
      );
    },
  },
  {
    name: 'Attendee FAQ Support Q&A',
    type: 'text',
    prompt: 'Answer this question: What is the cancellation policy? Context: The event has a strict no-refund cancellation policy.',
    validator: (text) => {
      const lower = text.toLowerCase();
      return lower.includes('no-refund') || lower.includes('strict');
    },
  },
];

/**
 * AI Benchmark & Evaluation Runner
 */
const runEvaluation = async () => {
  console.log('\n==================================================');
  console.log('       AI-OS Core Model Evaluation Runner       ');
  console.log('==================================================\n');

  const results = [];
  let passedCount = 0;

  for (const scenario of testScenarios) {
    console.log(`Running scenario: "${scenario.name}"...`);
    const startTime = Date.now();

    try {
      let output;
      let usage = { inputTokens: 0, outputTokens: 0 };
      let passed = false;

      if (scenario.type === 'structured') {
        const res = await AIGateway.generateStructuredJSON(scenario.prompt, scenario.schema);
        output = res.data;
        usage = res.usage;
        passed = scenario.validator(output);
      } else {
        const res = await AIGateway.generateText(scenario.prompt);
        output = res.text;
        usage = res.usage;
        passed = scenario.validator(output);
      }

      const duration = Date.now() - startTime;
      const txCost = CostTracker.trackCost(scenario.type === 'structured' ? 'gemini-1.5-flash' : 'gemini-1.5-flash', usage);

      if (passed) passedCount++;

      results.push({
        scenario: scenario.name,
        passed,
        durationMs: duration,
        tokens: usage,
        costUSD: txCost,
        output: typeof output === 'object' ? JSON.stringify(output) : output.substring(0, 100) + '...',
      });

      console.log(`  └─ Status: ${passed ? '✅ PASSED' : '❌ FAILED'} | Time: ${duration}ms | Cost: $${txCost.toFixed(6)}`);
    } catch (err) {
      console.error(`  └─ ❌ Error running scenario "${scenario.name}": ${err.message}`);
      results.push({
        scenario: scenario.name,
        passed: false,
        error: err.message,
      });
    }
  }

  const summary = {
    timestamp: new Date(),
    scenariosExecuted: testScenarios.length,
    scenariosPassed: passedCount,
    successRatio: passedCount / testScenarios.length,
    costTrackerSummary: CostTracker.getSummary(),
    details: results,
  };

  console.log('\n==================================================');
  console.log('              Evaluation Summary Summary          ');
  console.log('==================================================');
  console.log(`Success Rate : ${(summary.successRatio * 100).toFixed(1)}% (${passedCount}/${testScenarios.length})`);
  console.log(`Total Cost   : $${summary.costTrackerSummary.cumulativeCostUSD.toFixed(6)}`);
  console.log(`Total Tokens : In=${summary.costTrackerSummary.cumulativeTokens.input}, Out=${summary.costTrackerSummary.cumulativeTokens.output}`);
  console.log('==================================================\n');

  // Save report to disk
  const reportPath = path.resolve(__dirname, 'evaluation_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`Saved benchmark report to: ${reportPath}\n`);

  return summary;
};

// Auto-run if executed directly
if (require.main === module) {
  runEvaluation().catch(err => {
    console.error('Evaluation run aborted:', err);
    process.exit(1);
  });
}

module.exports = { runEvaluation };
