/**
 * Validation middleware factory using Joi schemas
 * Usage: router.post('/route', validate(schema), controller)
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: details,
      });
    }

    req[target] = value;
    next();
  };
};

module.exports = validate;
