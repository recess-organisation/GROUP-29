const { z } = require('zod');

const schemas = {
  register: z.object({
    full_name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(8).max(100),
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
  }),
  'forgot-password': z.object({
    email: z.string().email()
  }),
  'reset-password': z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(100)
  }),
  profile: z.object({
    full_name: z.string().min(2).max(120),
    phone: z.string().optional()
  }),
  'change-password': z.object({
    current_password: z.string().min(1),
    new_password: z.string().min(8).max(100)
  }),
  assignment: z.object({
    course_id: z.union([z.string(), z.number()]),
    title: z.string().min(2).max(160),
    instructions: z.string().min(2),
    due_date: z.string().optional(),
    total_marks: z.union([z.string(), z.number()]).optional()
  }),
  quiz: z.object({
    lesson_id: z.union([z.string(), z.number()]),
    title: z.string().min(2).max(200),
    instructions: z.string().optional(),
    passing_score: z.union([z.string(), z.number()]).optional(),
    max_attempts: z.union([z.string(), z.number()]).optional(),
    time_limit: z.union([z.string(), z.number()]).optional()
  }),
  'parental-rule': z.object({
    child_id: z.union([z.string(), z.number()]),
    day_of_week: z.union([z.string(), z.number()]).optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    max_daily_minutes: z.union([z.string(), z.number()]).optional(),
    activity: z.string().optional(),
    action: z.enum(['allow', 'block']).optional().default('block')
  }),
  'link-child': z.object({
    childEmail: z.string().email()
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
