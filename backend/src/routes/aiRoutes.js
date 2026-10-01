'use strict';

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { validate } = require('../middleware/validateMiddleware');
const {
  generateResponseSchema,
  analyzeSentimentSchema,
  predictChurnSchema,
  summarizeTicketSchema
} = require('../validators/aiValidator');

router.post('/generate-response', validate(generateResponseSchema), aiController.generateResponse);
router.post('/analyze-sentiment', validate(analyzeSentimentSchema), aiController.analyzeSentiment);
router.post('/predict-churn', validate(predictChurnSchema), aiController.predictChurn);
router.post('/summarize', validate(summarizeTicketSchema), aiController.summarizeTicket);

module.exports = router;
