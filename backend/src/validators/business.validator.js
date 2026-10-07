const { z } = require('zod');

const createBusinessSchema = z.object({
  name: z
    .string({ required_error: 'Business name is required' })
    .min(2, 'Business name must be at least 2 characters')
    .max(160, 'Business name must not exceed 160 characters')
    .transform(v => v.trim()),
  primary_category_id: z
    .number()
    .int()
    .positive('Category ID must be a positive integer')
    .optional()
    .nullable(),
  description: z
    .string()
    .max(5000, 'Description must not exceed 5000 characters')
    .optional()
    .nullable(),
  city: z
    .string()
    .max(100, 'City must not exceed 100 characters')
    .optional()
    .nullable(),
  state: z
    .string()
    .max(100, 'State must not exceed 100 characters')
    .optional()
    .nullable(),
  country: z
    .string()
    .max(100, 'Country must not exceed 100 characters')
    .optional()
    .nullable()
});

const updateBusinessSchema = z.object({
  name: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(160, 'Business name must not exceed 160 characters')
    .transform(v => v.trim())
    .optional(),
  primary_category_id: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  description: z
    .string()
    .max(5000)
    .optional()
    .nullable(),
  city: z
    .string()
    .max(100)
    .optional()
    .nullable(),
  state: z
    .string()
    .max(100)
    .optional()
    .nullable(),
  country: z
    .string()
    .max(100)
    .optional()
    .nullable(),
  status: z
    .enum(['ACTIVE', 'SUSPENDED', 'UNVERIFIED', 'VERIFIED'])
    .optional()
});

const addMemberSchema = z.object({
  user_id: z
    .number({ required_error: 'User ID is required' })
    .int()
    .positive('User ID must be a positive integer'),
  member_role: z
    .enum(['ADMIN', 'STAFF'], {
      errorMap: () => ({ message: 'Member role must be either ADMIN or STAFF' })
    })
    .default('STAFF')
});

const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'Category name is required' })
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must not exceed 100 characters')
    .transform(v => v.trim()),
  parent_id: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
});

const createServiceSchema = z.object({
  title: z
    .string({ required_error: 'Service title is required' })
    .min(2, 'Service title must be at least 2 characters')
    .max(160, 'Service title must not exceed 160 characters')
    .transform(v => v.trim()),
  category_id: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  price_min: z
    .number()
    .min(0, 'Minimum price must be non-negative')
    .optional()
    .nullable(),
  price_max: z
    .number()
    .min(0, 'Maximum price must be non-negative')
    .optional()
    .nullable(),
  status: z
    .enum(['ACTIVE', 'INACTIVE'])
    .default('ACTIVE')
}).refine(
  data => {
    if (data.price_min != null && data.price_max != null) {
      return data.price_min <= data.price_max;
    }
    return true;
  },
  {
    message: 'Minimum price cannot exceed maximum price',
    path: ['price_min']
  }
);

const updateServiceSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(160)
    .transform(v => v.trim())
    .optional(),
  category_id: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  price_min: z
    .number()
    .min(0)
    .optional()
    .nullable(),
  price_max: z
    .number()
    .min(0)
    .optional()
    .nullable(),
  status: z
    .enum(['ACTIVE', 'INACTIVE'])
    .optional()
}).refine(
  data => {
    if (data.price_min != null && data.price_max != null) {
      return data.price_min <= data.price_max;
    }
    return true;
  },
  {
    message: 'Minimum price cannot exceed maximum price',
    path: ['price_min']
  }
);

const createNeedSchema = z.object({
  title: z
    .string({ required_error: 'Need title is required' })
    .min(2, 'Need title must be at least 2 characters')
    .max(160, 'Need title must not exceed 160 characters')
    .transform(v => v.trim()),
  category_id: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  budget_min: z
    .number()
    .min(0, 'Minimum budget must be non-negative')
    .optional()
    .nullable(),
  budget_max: z
    .number()
    .min(0, 'Maximum budget must be non-negative')
    .optional()
    .nullable(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must be formatted as YYYY-MM-DD')
    .optional()
    .nullable()
}).refine(
  data => {
    if (data.budget_min != null && data.budget_max != null) {
      return data.budget_min <= data.budget_max;
    }
    return true;
  },
  {
    message: 'Minimum budget cannot exceed maximum budget',
    path: ['budget_min']
  }
);

const updateNeedSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(160)
    .transform(v => v.trim())
    .optional(),
  category_id: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  budget_min: z
    .number()
    .min(0)
    .optional()
    .nullable(),
  budget_max: z
    .number()
    .min(0)
    .optional()
    .nullable(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must be formatted as YYYY-MM-DD')
    .optional()
    .nullable()
}).refine(
  data => {
    if (data.budget_min != null && data.budget_max != null) {
      return data.budget_min <= data.budget_max;
    }
    return true;
  },
  {
    message: 'Minimum budget cannot exceed maximum budget',
    path: ['budget_min']
  }
);

module.exports = {
  createBusinessSchema,
  updateBusinessSchema,
  addMemberSchema,
  createCategorySchema,
  createServiceSchema,
  updateServiceSchema,
  createNeedSchema,
  updateNeedSchema
};
