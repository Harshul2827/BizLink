const { z } = require('zod');

const targetTypeEnum = z.enum(['USER', 'BUSINESS', 'POST', 'REVIEW', 'MESSAGE']);

const createReportSchema = z.object({
  target_type: targetTypeEnum,
  target_id: z.coerce.number().int().positive({ message: 'target_id must be a positive integer' }),
  reason: z.string().min(5, { message: 'Reason must be at least 5 characters' }).max(255, { message: 'Reason cannot exceed 255 characters' })
});

const listReportsQuerySchema = z.object({
  status: z.enum(['OPEN', 'RESOLVED']).optional(),
  target_type: targetTypeEnum.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20)
});

const updateBusinessStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'UNVERIFIED', 'VERIFIED'], {
    message: "status must be one of: 'ACTIVE', 'SUSPENDED', 'UNVERIFIED', 'VERIFIED'"
  })
});

const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED'], {
    message: "status must be one of: 'ACTIVE', 'SUSPENDED'"
  })
});

module.exports = {
  createReportSchema,
  listReportsQuerySchema,
  updateBusinessStatusSchema,
  updateUserStatusSchema
};
