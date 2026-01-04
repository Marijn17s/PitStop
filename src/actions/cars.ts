"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createCar, updateCar, deleteCar } from "@/lib/db/queries/cars";

const carSchema = z.object({
  brand: z
    .string()
    .min(1, "Brand is required")
    .max(100, "Brand has a maximum of 100 characters"),
  model: z
    .string()
    .min(1, "Model is required")
    .max(100, "Model has a maximum of 100 characters"),
  year: z
    .number()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be more than next year"),
  color: z
    .string()
    .min(1, "Color is required")
    .max(50, "Color has a maximum of 50 characters"),
  licensePlate: z
    .string()
    .max(20, "License plate has a maximum of 20 characters")
    .optional()
    .or(z.literal("")),
  owner: z
    .string()
    .max(200, "Owner name has a maximum of 200 characters")
    .optional()
    .or(z.literal("")),
});

export async function createCarAction(formData: FormData) {
  const validatedFields = carSchema.safeParse({
    brand: formData.get("brand"),
    model: formData.get("model"),
    year: Number(formData.get("year")),
    color: formData.get("color"),
    licensePlate: formData.get("licensePlate") || undefined,
    owner: formData.get("owner") || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  try {
    await createCar(validatedFields.data);
  } catch {
    return {
      error: "Failed to create car. Please try again.",
    };
  }

  revalidatePath("/cars");
  redirect("/cars");
}

export async function updateCarAction(id: number, formData: FormData) {
  const validatedFields = carSchema.safeParse({
    brand: formData.get("brand"),
    model: formData.get("model"),
    year: Number(formData.get("year")),
    color: formData.get("color"),
    licensePlate: formData.get("licensePlate") || undefined,
    owner: formData.get("owner") || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  try {
    await updateCar(id, validatedFields.data);
  } catch {
    return {
      error: "Failed to update car. Please try again.",
    };
  }

  revalidatePath("/cars");
  revalidatePath(`/cars/${id}`);
  redirect(`/cars/${id}`);
}

export async function deleteCarAction(id: number) {
  try {
    await deleteCar(id);
  } catch {
    return {
      error: "Failed to delete car. Please try again.",
    };
  }

  revalidatePath("/cars");
  redirect("/cars");
}

