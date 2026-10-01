'use strict';

const { z } = require('zod');

const submitFeedbackSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  channel: z.enum(['Zendesk', 'Intercom', 'G2 Crowd', 'Twitter/X', 'Email', 'In-App Survey']).default('In-App Survey'),
  rating: z.number().min(1).max(5).default(5),
  npsScore: z.number().min(0).max(10).optional().default(8),
  sentiment: z.enum(['Positive', 'Neutral', 'Negative']).default('Positive'),
  sentimentScore: z.number().min(-1).max(1).default(0.5),
  comment: z.string().min(3, 'Comment text is required'),
  topic: z.string().optional().default('General'),
  tags: z.array(z.string()).optional().default([]),
});

module.exports = {
  submitFeedbackSchema
};
