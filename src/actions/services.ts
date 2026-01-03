"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createService, updateService, deleteService } from "@/lib/db/queries/services";

const serviceSchema = z.object({
  carId: z.number({required_error: "Car is required"}),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]),
  notes: z.string().optional(),
  mechanicIds: z.array(z.number()).min(1, "At least one mechanic is required"),
});

export async function createServiceAction(formData: FormData) {
  const mechanicIds = formData.getAll("mechanicIds").map(id => parseInt(id as string));
  
  const validatedFields = serviceSchema.safeParse({
    carId: parseInt(formData.get("carId") as string),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
    mechanicIds,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { carId, startDate, endDate, status, notes, mechanicIds } = validatedFields.data;
    await createService({
      carId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      status,
      notes,
      mechanicIds,
    });
  } catch (error) {
    return {
      error: "Failed to create service. Please try again.",
    };
  }

  revalidatePath("/services");
  redirect("/services");
}

export async function updateServiceAction(id: number, formData: FormData) {
  const mechanicIds = formData.getAll("mechanicIds").map(id => parseInt(id as string));
  
  const validatedFields = serviceSchema.safeParse({
    carId: parseInt(formData.get("carId") as string),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
    mechanicIds,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { carId, startDate, endDate, status, notes, mechanicIds } = validatedFields.data;
    await updateService(id, {
      carId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      status,
      notes,
      mechanicIds,
    });
  } catch (error) {
    return {
      error: "Failed to update service. Please try again.",
    };
  }

  revalidatePath("/services");
  revalidatePath(`/services/${id}`);
  redirect(`/services/${id}`);
}

export async function deleteServiceAction(id: number) {
  try {
    await deleteService(id);
  } catch (error) {
    return {
      error: "Failed to delete service. Please try again.",
    };
  }

  revalidatePath("/services");
  redirect("/services");
}

