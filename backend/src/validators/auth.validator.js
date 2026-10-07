const { z } = require('zod');

const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .max(190, 'Email must not exceed 190 characters')
    .transform(val => val.toLowerCase().trim()),
  phone: z
    .string()
    .max(20, 'Phone must not exceed 20 characters')
    .optional()
    .nullable(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long'),
  full_name: z
    .string({ required_error: 'Full name is required' })
    .min(1, 'Full name cannot be empty')
    .max(120, 'Full name must not exceed 120 characters')
    .transform(val => val.trim()),
  avatar_url: z
    .string()
    .url('Invalid URL for avatar')
    .max(500, 'Avatar URL must not exceed 500 characters')
    .optional()
    .nullable(),
  role: z
    .enum(['OWNER', 'PARTNER', 'ADMIN'], {
      errorMap: () => ({ message: 'Role must be OWNER, PARTNER, or ADMIN' })
    })
    .default('OWNER')
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .transform(val => val.toLowerCase().trim()),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty')
});

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .transform(val => val.toLowerCase().trim())
});

const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'Reset token is required' })
    .min(1, 'Reset token cannot be empty'),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters long')
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
