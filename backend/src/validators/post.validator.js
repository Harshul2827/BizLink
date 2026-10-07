const { z } = require('zod');

const createPostSchema = z.object({
  business_id: z.coerce.number().int().positive({ message: 'business_id must be a positive integer' }),
  content: z.string().min(5, { message: 'Post content must be at least 5 characters' }).max(3000, { message: 'Post content must not exceed 3000 characters' })
});

const createInteractionSchema = z.object({
  interaction_type: z.enum(['LIKE', 'COMMENT'], { message: "interaction_type must be either 'LIKE' or 'COMMENT'" }),
  body: z.string().max(1000, { message: 'Comment body cannot exceed 1000 characters' }).nullable().optional()
}).refine(data => {
  if (data.interaction_type === 'COMMENT') {
    return typeof data.body === 'string' && data.body.trim().length > 0;
  }
  return true;
}, {
  message: 'body is required when interaction_type is COMMENT',
  path: ['body']
});

const listPostsQuerySchema = z.object({
  business_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20)
});

module.exports = {
  createPostSchema,
  createInteractionSchema,
  listPostsQuerySchema
};
