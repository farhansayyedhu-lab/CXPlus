'use strict';

const { z } = require('zod');

const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().optional().default(''),
  total_orders: z.number().int().nonnegative().optional().default(1),
  total_spent: z.number().nonnegative().optional().default(0),
  satisfaction_score: z.number().min(0).max(5).optional().default(4.5),
  customer_risk: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Low'),
  risk_score: z.number().min(0).max(100).optional().default(20),
  risk_factors: z.array(z.string()).optional().default([]),
  ltv: z.string().optional().default('$0 ARR'),
  since: z.string().optional().default('Jan 2024'),
});

const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  total_orders: z.number().int().nonnegative().optional(),
  total_spent: z.number().nonnegative().optional(),
  satisfaction_score: z.number().min(0).max(5).optional(),
  customer_risk: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  risk_score: z.number().min(0).max(100).optional(),
  risk_factors: z.array(z.string()).optional(),
  ltv: z.string().optional(),
  since: z.string().optional(),
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
};
