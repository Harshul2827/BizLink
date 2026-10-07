const { z } = require('zod');

const createReviewSchema = z.object({
  reviewer_business_id: z.coerce.number().int().positive({ message: 'Reviewer business ID must be a positive integer' }),
  reviewed_business_id: z.coerce.number().int().positive({ message: 'Reviewed business ID must be a positive integer' }),
  collaboration_id: z.coerce.number().int().positive().nullable().optional(),
  rating: z.coerce.number().int().min(1, { message: 'Rating must be at least 1' }).max(5, { message: 'Rating must not exceed 5' }),
  title: z.string().max(160, { message: 'Title cannot exceed 160 characters' }).nullable().optional()
}).refine(data => data.reviewer_business_id !== data.reviewed_business_id, {
  message: 'A business cannot review itself',
  path: ['reviewed_business_id']
});

const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20)
});

module.exports = {
  createReviewSchema,
  listReviewsQuerySchema
};
