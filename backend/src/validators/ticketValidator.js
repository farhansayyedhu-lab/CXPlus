'use strict';

const { z } = require('zod');

const createTicketSchema = z.object({
  customer_id: z.string().optional(),
  customerId: z.string().optional(),
  customer_name: z.string().optional(),
  customerName: z.string().optional(),
  customer_email: z.string().email().optional(),
  customerEmail: z.string().email().optional(),
  company: z.string().optional(),
  subject: z.string().min(2).optional(),
  title: z.string().min(2).optional(),
  message: z.string().min(2).optional(),
  description: z.string().min(2).optional(),
  issue: z.string().optional(),
  priority: z.enum(['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low', 'critical', 'high', 'medium', 'low']).optional().default('P3 - Medium'),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional().default('open'),
  intent: z.string().optional(),
  sentiment: z.enum(['Positive', 'Neutral', 'Negative', 'Critical', 'positive', 'neutral', 'negative', 'critical']).optional().default('Neutral'),
  emotion: z.string().optional(),
  customer_risk: z.string().optional(),
  risk_score: z.number().min(0).max(100).optional(),
  assigned_to: z.string().nullable().optional(),
});

const updateTicketSchema = z.object({
  subject: z.string().min(2).optional(),
  title: z.string().min(2).optional(),
  message: z.string().optional(),
  issue: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low', 'critical', 'high', 'medium', 'low']).optional(),
  sentiment: z.enum(['Positive', 'Neutral', 'Negative', 'Critical', 'positive', 'neutral', 'negative', 'critical']).optional(),
  customer_risk: z.string().optional(),
  risk_score: z.number().min(0).max(100).optional(),
  assigned_to: z.string().nullable().optional(),
  requires_escalation: z.boolean().optional(),
  ai_summary: z.string().optional(),
  ai_response: z.string().optional(),
  recommended_action: z.string().optional(),
});

const createMessageSchema = z.object({
  sender_type: z.enum(['customer', 'agent', 'ai']).optional().default('agent'),
  sender_name: z.string().min(1, 'Sender name is required').optional().default('Agent'),
  message: z.string().min(1, 'Message is required'),
});

const assignTicketSchema = z.object({
  assigned_to: z.string().min(1, 'Assigned agent user ID is required'),
});

const useAiResponseSchema = z.object({
  response: z.string().min(1, 'AI response text is required'),
  sender_name: z.string().optional().default('Alex Morgan'),
});

module.exports = {
  createTicketSchema,
  updateTicketSchema,
  createMessageSchema,
  addCommentSchema: createMessageSchema,
  assignTicketSchema,
  useAiResponseSchema,
};
