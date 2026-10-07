const { z } = require('zod');

const createConnectionSchema = z.object({
  requester_business_id: z
    .number({ required_error: 'Requester business ID is required' })
    .int()
    .positive('Requester business ID must be a positive integer'),
  receiver_business_id: z
    .number({ required_error: 'Receiver business ID is required' })
    .int()
    .positive('Receiver business ID must be a positive integer')
}).refine(
  data => data.requester_business_id !== data.receiver_business_id,
  {
    message: 'Businesses cannot connect to themselves',
    path: ['receiver_business_id']
  }
);

const updateConnectionStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'CANCELLED', 'BLOCKED'], {
    errorMap: () => ({ message: 'Status must be ACCEPTED, REJECTED, CANCELLED, or BLOCKED' })
  })
});

const sendMessageSchema = z.object({
  sender_business_id: z
    .number({ required_error: 'Sender business ID is required' })
    .int()
    .positive('Sender business ID must be a positive integer'),
  body: z
    .string({ required_error: 'Message body is required' })
    .min(1, 'Message body cannot be empty')
    .max(4000, 'Message body cannot exceed 4000 characters')
    .transform(v => v.trim())
});

const listConnectionsSchema = z.object({
  business_id: z.coerce.number().int().positive('Business ID must be a positive integer'),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'BLOCKED']).optional(),
  direction: z.enum(['ALL', 'SENT', 'RECEIVED']).default('ALL'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

module.exports = {
  createConnectionSchema,
  updateConnectionStatusSchema,
  sendMessageSchema,
  listConnectionsSchema
};
