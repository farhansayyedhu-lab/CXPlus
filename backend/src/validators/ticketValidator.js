'use strict';

const { z } = require('zod');

const createTicketSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid customer email is required'),
  company: z.string().optional().default(''),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  priority: z.enum(['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low']).default('P3 - Medium'),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).default('open'),
  category: z.string().optional().default('general'),
  sentiment: z.enum(['Positive', 'Neutral', 'Negative', 'Critical']).optional().default('Neutral'),
  riskScore: z.number().min(0).max(100).optional().default(20),
});

const updateTicketSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low']).optional(),
  sentiment: z.enum(['Positive', 'Neutral', 'Negative', 'Critical']).optional(),
  riskScore: z.number().min(0).max(100).optional(),
  assignedTo: z.string().nullable().optional(),
  notes: z.string().optional(),
});

const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment text is required'),
  isInternal: z.boolean().optional().default(false),
  authorName: z.string().optional().default('Agent'),
});

const priorityQueueFilterSchema = z.object({
  filter: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

module.exports = {
  createTicketSchema,
  updateTicketSchema,
  addCommentSchema,
  priorityQueueFilterSchema
};
