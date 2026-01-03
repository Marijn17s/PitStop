"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Car } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CarFormProps {
  car?: Car;
  action: (formData: FormData) => Promise<any>;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700">
      {pending ? "Saving..." : isEdit ? "Update Car" : "Add Car"}
    </Button>
  );
}

export function CarForm({ car, action }: CarFormProps) {
  const [error, setError] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{car ? "Edit Car" : "Add New Car"}</CardTitle>
        <CardDescription>
          {car ? "Update the car information below" : "Enter the details of the new car"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                name="brand"
                placeholder="Toyota"
                defaultValue={car?.brand}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                name="model"
                placeholder="Camry"
                defaultValue={car?.model}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                name="year"
                type="number"
                min="1900"
                max={currentYear + 1}
                placeholder={currentYear.toString()}
                defaultValue={car?.year}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <Input
                id="color"
                name="color"
                placeholder="Silver"
                defaultValue={car?.color}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input
                id="licensePlate"
                name="licensePlate"
                placeholder="ABC-123"
                defaultValue={car?.license_plate || ""}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                name="owner"
                placeholder="John Doe"
                defaultValue={car?.owner || ""}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <SubmitButton isEdit={!!car} />
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

