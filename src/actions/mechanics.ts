"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createMechanic, updateMechanic, deleteMechanic } from "@/lib/db/queries/mechanics";

const mechanicSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name has a maximum of 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name has a maximum of 50 characters"),
  yearsExperience: z
    .number()
    .min(0, "Years of experience cannot be negative")
    .max(100, "Years of experience has a maximum of 100"),
  email: z
    .string()
    .max(255, "Email has a maximum of 255 characters")
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
});

export async function createMechanicAction(formData: FormData) {
  const validatedFields = mechanicSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    yearsExperience: Number(formData.get("yearsExperience")),
    email: formData.get("email") || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  try {
    await createMechanic(validatedFields.data);
  } catch {
    return {
      error: "Failed to create mechanic. Please try again.",
    };
  }

  revalidatePath("/mechanics");
  redirect("/mechanics");
}

export async function updateMechanicAction(id: number, formData: FormData) {
  const validatedFields = mechanicSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    yearsExperience: Number(formData.get("yearsExperience")),
    email: formData.get("email") || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  try {
    await updateMechanic(id, validatedFields.data);
  } catch {
    return {
      error: "Failed to update mechanic. Please try again.",
    };
  }

  revalidatePath("/mechanics");
  revalidatePath(`/mechanics/${id}`);
  redirect(`/mechanics/${id}`);
}

export async function deleteMechanicAction(id: number) {
  try {
    await deleteMechanic(id);
  } catch {
    return {
      error: "Failed to delete mechanic. Please try again.",
    };
  }

  revalidatePath("/mechanics");
  redirect("/mechanics");
}

