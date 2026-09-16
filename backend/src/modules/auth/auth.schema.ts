import { z } from 'zod';

export const googleAuthSchema = z.object({
  idToken: z.string().optional(),
  googleId: z.string().optional(),
  email: z.string().email('Valid email address is required'),
  name: z.string().min(1, 'Name is required'),
  picture: z.string().optional(),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

export const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type EmailLoginInput = z.infer<typeof emailLoginSchema>;
