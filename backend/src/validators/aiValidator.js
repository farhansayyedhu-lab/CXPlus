'use strict';

const { z } = require('zod');

// Input request schemas
const analyzeTicketSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
});

const regenerateResponseSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  tone: z.enum(['empathetic', 'professional', 'concise', 'friendly', 'default', 'shorter', 'firm']).default('default'),
});

const generateResponseSchema = z.object({
  ticketId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  issue: z.string().min(3, 'Issue context is required'),
  tone: z.enum(['empathetic', 'professional', 'concise', 'friendly', 'default', 'shorter', 'firm']).default('default'),
  intent: z.string().optional(),
  ltv: z.string().optional(),
  riskScore: z.number().optional(),
  customInstructions: z.string().optional(),
});

const generateInsightsSchema = z.object({
  timeRange: z.string().optional().default('7d'),
  department: z.string().optional(),
});

// Gemini Output Structured Validation Schemas
const aiAnalysisOutputSchema = z.object({
  intent: z.string(),
  sentiment: z.string(),
  emotion: z.string(),
  priority: z.string(),
  customerRisk: z.string(),
  summary: z.string(),
  suggestedResponse: z.string(),
  recommendedAction: z.string(),
  requiresEscalation: z.boolean(),
});

const aiInsightsOutputSchema = z.object({
  summary: z.string(),
  top_issues: z.array(z.any()).default([]),
  risk_areas: z.array(z.any()).default([]),
  recommendations: z.array(z.any()).default([]),
  trends: z.array(z.any()).default([]),
});

module.exports = {
  analyzeTicketSchema,
  regenerateResponseSchema,
  generateResponseSchema,
  generateInsightsSchema,
  aiAnalysisOutputSchema,
  aiInsightsOutputSchema,
};
