'use strict';

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { validate } = require('../middleware/validationMiddleware');
const { aiLimiter } = require('../middleware/rateLimitMiddleware');
const {
  analyzeTicketSchema,
  regenerateResponseSchema,
  generateResponseSchema,
  generateInsightsSchema
} = require('../validators/aiValidator');

// 1. Analyze Ticket with Gemini AI
router.post('/analyze-ticket', aiLimiter, validate(analyzeTicketSchema), aiController.analyzeTicket);

// 2. Regenerate Contextual Tone Response
router.post('/regenerate-response', aiLimiter, validate(regenerateResponseSchema), aiController.regenerateResponse);

// 3. Response Composer Synthesizer
router.post('/generate-response', aiLimiter, validate(generateResponseSchema), aiController.generateResponse);

// 4. Strategic Business Insights
router.post('/generate-insights', aiLimiter, validate(generateInsightsSchema), aiController.generateInsights);

module.exports = router;
