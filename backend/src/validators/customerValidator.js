'use strict';

const { z } = require('zod');

const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  company: z.string().optional().default(''),
  ltv: z.string().optional().default('$0 ARR'),
  riskScore: z.number().min(0).max(100).optional().default(10),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Low'),
  intent: z.string().optional().default(''),
  emotion: z.string().optional().default(''),
  since: z.string().optional().default('Just now'),
});

const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  company: z.string().optional(),
  ltv: z.string().optional(),
  riskScore: z.number().min(0).max(100).optional(),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  intent: z.string().optional(),
  emotion: z.string().optional(),
  aiRecommendation: z.string().optional(),
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema
};
