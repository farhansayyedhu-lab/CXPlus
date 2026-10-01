'use strict';

const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { validate } = require('../middleware/validateMiddleware');
const { submitFeedbackSchema } = require('../validators/feedbackValidator');

router.get('/', feedbackController.getFeedback);
router.post('/', validate(submitFeedbackSchema), feedbackController.submitFeedback);

module.exports = router;
