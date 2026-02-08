import { z } from 'zod';

// ============================================
// Shared Zod Schemas for input validation
// Used across waitlist, auth, onboarding, profile, and messaging
// ============================================

// -- Primitives --
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters')
  .email('Please enter a valid email address');

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must be less than 128 characters');

export const uuidSchema = z
  .string()
  .uuid('Must be a valid ID');

export const messageContentSchema = z
  .string()
  .trim()
  .min(1, 'Message cannot be empty')
  .max(5000, 'Message is too long (max 5000 characters)');

// -- Waitlist --
export const waitlistStep1Schema = z.object({
  firstName: nameSchema,
  lastName: z.string().trim().max(100, 'Last name too long').optional().default(''),
  email: emailSchema,
});

export const waitlistStep2Schema = z.object({
  ageRange: z.string().min(1, 'Age range is required'),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(100, 'City name too long')
    .refine(
      (val) => val.toLowerCase().includes('chicago'),
      'We\'re launching in Chicago first'
    ),
  genderIdentity: z.string().trim().min(1, 'Gender identity is required').max(100),
  lookingFor: z.string().trim().min(1, 'This field is required').max(100),
  relationshipGoal: z.string().min(1, 'Relationship goal is required'),
});

export const waitlistStep3Schema = z.object({
  whyMonark: z
    .string()
    .trim()
    .min(20, 'Please write at least a sentence (20+ characters)')
    .max(2000, 'Response is too long'),
  heardAboutUs: z.string().trim().max(500).optional().default(''),
  willingToBeta: z.boolean().default(false),
  emailOptIn: z.boolean().default(true),
});

export const waitlistSubmissionSchema = waitlistStep1Schema
  .merge(waitlistStep2Schema)
  .merge(waitlistStep3Schema);

// -- Auth --
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Terms of Service' }),
  }),
});

// -- Profile / Onboarding --
export const basicProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
});

export const profileUpdateSchema = z.object({
  bio: z.string().trim().max(1000, 'Bio must be less than 1000 characters').optional(),
  occupation: z.string().trim().max(100, 'Occupation must be less than 100 characters').optional(),
  interests: z.array(z.string().max(50)).max(20, 'You can select up to 20 interests').optional(),
  photos: z.array(z.string().url()).max(6, 'You can upload up to 6 photos').optional(),
  education_level: z.string().max(100).optional(),
  relationship_goals: z.array(z.string().max(100)).max(5).optional(),
  height_cm: z.number().min(100).max(250).optional().nullable(),
  exercise_habits: z.string().max(100).optional(),
  smoking_status: z.string().max(50).optional(),
  drinking_status: z.string().max(50).optional(),
});

// -- Edge function inputs --
export const securityMiddlewareSchema = z.object({
  action: z.string().min(1).max(100),
  targetUserId: uuidSchema.optional(),
  resourceType: z.string().max(100).optional(),
  resourceId: z.string().max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const shareContactSchema = z.object({
  recipientUserId: uuidSchema,
  conversationId: z.string().min(1).max(255),
});

export const waitlistEmailSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
});

export const companionChatSchema = z.object({
  type: z.enum(['generate_insights', 'chat_response', 'celebration']),
  userContext: z.object({
    recentDates: z.array(z.unknown()).optional(),
    rifProfile: z.unknown().optional(),
    interests: z.array(z.string()).optional(),
    averageRating: z.number().optional(),
    totalDates: z.number().optional(),
    userMessage: z.string().max(5000).optional(),
  }).optional(),
});

// -- Utility: extract first error message --
export function getFirstError(result: z.SafeParseReturnType<unknown, unknown>): string | null {
  if (result.success) return null;
  const firstIssue = result.error.issues[0];
  return firstIssue?.message ?? 'Validation failed';
}

// -- Utility: extract all error messages by field --
export function getFieldErrors(result: z.SafeParseReturnType<unknown, unknown>): Record<string, string> {
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0]?.toString();
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
