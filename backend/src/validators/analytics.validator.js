const { z } = require('zod');

const analyticsQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'From date must be formatted as YYYY-MM-DD')
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'To date must be formatted as YYYY-MM-DD')
    .optional(),
  granularity: z
    .enum(['day', 'week', 'month', 'year'])
    .default('month')
});

module.exports = {
  analyticsQuerySchema
};
