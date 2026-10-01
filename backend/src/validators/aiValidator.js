'use strict';

const { z } = require('zod');

const generateResponseSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  issue: z.string().min(3, 'Issue or message context is required'),
  tone: z.enum(['default', 'shorter', 'empathetic', 'professional', 'firm']).default('default'),
  intent: z.string().optional(),
  ltv: z.string().optional(),
  riskScore: z.number().optional(),
  customInstructions: z.string().optional(),
});

const analyzeSentimentSchema = z.object({
  text: z.string().min(3, 'Text to analyze is required'),
  context: z.string().optional(),
});

const predictChurnSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  recentTickets: z.array(z.string()).optional(),
  sentimentTrend: z.array(z.number()).optional(),
  unresolvedCount: z.number().optional(),
  billingIssues: z.boolean().optional(),
});

const summarizeTicketSchema = z.object({
  ticketId: z.string().optional(),
  conversationHistory: z.array(z.object({
    sender: z.string(),
    text: z.string(),
    timestamp: z.string().optional()
  })).min(1, 'At least one message is required')
});

module.exports = {
  generateResponseSchema,
  analyzeSentimentSchema,
  predictChurnSchema,
  summarizeTicketSchema
};
