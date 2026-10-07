const { z } = require('zod');

const statusEnum = z.enum([
  'DRAFT',
  'REQUESTED',
  'NEGOTIATING',
  'ACCEPTED',
  'ACTIVE',
  'COMPLETED',
  'DECLINED',
  'CANCELLED'
]);

const createCollaborationSchema = z.object({
  initiator_business_id: z.coerce.number().int().positive({ message: 'Initiator business ID must be a positive integer' }),
  partner_business_ids: z.array(z.coerce.number().int().positive()).min(1, { message: 'At least one partner business ID is required' }).optional(),
  partner_business_id: z.coerce.number().int().positive().optional(),
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(160, { message: 'Title must not exceed 160 characters' }),
  need_id: z.coerce.number().int().positive().nullable().optional(),
  service_id: z.coerce.number().int().positive().nullable().optional(),
  status: z.enum(['DRAFT', 'REQUESTED']).optional().default('REQUESTED'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'start_date must be in YYYY-MM-DD format' }).nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'end_date must be in YYYY-MM-DD format' }).nullable().optional()
}).refine(data => data.partner_business_ids || data.partner_business_id, {
  message: 'Either partner_business_ids or partner_business_id must be provided',
  path: ['partner_business_ids']
});

const updateCollaborationStatusSchema = z.object({
  status: statusEnum,
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'start_date must be in YYYY-MM-DD format' }).nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'end_date must be in YYYY-MM-DD format' }).nullable().optional()
});

const listCollaborationsQuerySchema = z.object({
  business_id: z.coerce.number().int().positive({ message: 'business_id is required and must be a positive integer' }),
  status: statusEnum.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20)
});

module.exports = {
  createCollaborationSchema,
  updateCollaborationStatusSchema,
  listCollaborationsQuerySchema
};
