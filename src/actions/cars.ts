"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createCar, updateCar, deleteCar } from "@/lib/db/queries/cars";

const carSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, "Color is required"),
  licensePlate: z.string().optional(),
  owner: z.string().optional(),
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
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await createCar(validatedFields.data);
  } catch (error) {
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
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await updateCar(id, validatedFields.data);
  } catch (error) {
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
  } catch (error) {
    return {
      error: "Failed to delete car. Please try again.",
    };
  }

  revalidatePath("/cars");
  redirect("/cars");
}

