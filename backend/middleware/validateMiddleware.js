const { z } = require('zod');

const schemas = {
  register: z.object({
    full_name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6).max(100),
    role: z.enum(['student', 'teacher', 'parent']).optional().default('student')
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  }),
  course: z.object({
    title: z.string().min(2).max(160),
    description: z.string().min(2),
    category_id: z.union([z.string(), z.number()]).optional(),
    level: z.string().optional(),
    duration: z.string().optional()
  }),
  lesson: z.object({
    title: z.string().min(2).max(160),
    content: z.string().optional(),
    lesson_order: z.union([z.string(), z.number()]).optional(),
    course_id: z.union([z.string(), z.number()]).optional()
  })
};

function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) return next();

    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const first = Object.values(errors).flat()[0] || 'Validation failed';
      return res.status(400).json({ message: first, errors });
    }

    req.body = result.data;
    next();
  };
}

module.exports = { validate, schemas };
