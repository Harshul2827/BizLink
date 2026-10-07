const { ValidationError } = require('../errors/AppError');

/**
 * Creates a middleware that validates request data against a Zod schema.
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} [source='body']
 */
function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const details = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return next(new ValidationError('Invalid request payload', details));
      }
      return next(err);
    }
  };
}

module.exports = {
  validate
};
