'use strict';

const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { submitFeedbackSchema } = require('../validators/feedbackValidator');
const { validate } = require('../validators/authValidator');

router.get('/', feedbackController.getFeedback);
router.post('/', validate(submitFeedbackSchema), feedbackController.submitFeedback);

module.exports = router;
