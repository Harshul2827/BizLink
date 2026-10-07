const { z } = require('zod');

const discoverBusinessesSchema = z.object({
  search: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(['ACTIVE', 'VERIFIED']).optional(),
  hasServices: z.coerce.boolean().optional(),
  hasNeeds: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'created_at', 'status']).default('created_at'),
  sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).default('DESC'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

const discoverServicesSchema = z.object({
  search: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  businessId: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  sortBy: z.enum(['price_min', 'price_max', 'title', 'created_at']).default('title'),
  sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).default('ASC'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

const discoverNeedsSchema = z.object({
  search: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  businessId: z.coerce.number().int().positive().optional(),
  minBudget: z.coerce.number().min(0).optional(),
  maxBudget: z.coerce.number().min(0).optional(),
  deadlineBefore: z.string().date().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  sortBy: z.enum(['budget_min', 'budget_max', 'deadline', 'title']).default('deadline'),
  sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).default('ASC'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

const matchQuerySchema = z.object({
  minScore: z.coerce.number().min(0).max(1).default(0.3),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

module.exports = {
  discoverBusinessesSchema,
  discoverServicesSchema,
  discoverNeedsSchema,
  matchQuerySchema
};
