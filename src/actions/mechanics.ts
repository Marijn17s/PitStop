"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createMechanic, updateMechanic, deleteMechanic } from "@/lib/db/queries/mechanics";

const mechanicSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  yearsExperience: z.number().min(0).max(100),
  email: z.email().optional().or(z.literal("")),
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

