"use server";

import bcrypt from "bcryptjs";
import { createUser, getUserByEmail } from "@/lib/db/queries/users";

export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  try {
    const existingUser = await getUserByEmail(data.email);
    
    if (existingUser) {
      return { error: "Email already registered" };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await createUser(
      data.email,
      passwordHash,
      data.firstName,
      data.lastName
    );

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}

