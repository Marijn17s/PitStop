"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { createUser, getUserByEmail } from "@/lib/db/queries/users";

const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email has a maximum of 255 characters")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password has a maximum of 255 characters"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name has a maximum of 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name has a maximum of 100 characters"),
});

export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  try {
    const validatedFields = registerSchema.safeParse(data);

    if (!validatedFields.success) {
      const errors = z.flattenError(validatedFields.error).fieldErrors;
      const firstError = Object.values(errors)[0]?.[0];
      return { error: firstError || "Validation failed" };
    }

    const { email, password, firstName, lastName } = validatedFields.data;

    const existingUser = await getUserByEmail(email);
    
    if (existingUser) {
      return { error: "There is already an account associated with this email" };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await createUser(
      email,
      passwordHash,
      firstName,
      lastName
    );

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}

