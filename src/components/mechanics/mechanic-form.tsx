"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Mechanic } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MechanicFormProps {
  mechanic?: Mechanic;
  action: (formData: FormData) => Promise<any>;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700">
      {pending ? "Saving..." : isEdit ? "Update Mechanic" : "Add Mechanic"}
    </Button>
  );
}

export function MechanicForm({ mechanic, action }: MechanicFormProps) {
  const [error, setError] = useState<string | null>(null);

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
        <CardTitle>{mechanic ? "Edit Mechanic" : "Add New Mechanic"}</CardTitle>
        <CardDescription>
          {mechanic ? "Update the mechanic information below" : "Enter the details of the new mechanic"}
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
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                defaultValue={mechanic?.first_name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Smith"
                defaultValue={mechanic?.last_name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience *</Label>
              <Input
                id="yearsExperience"
                name="yearsExperience"
                type="number"
                min="0"
                max="100"
                placeholder="5"
                defaultValue={mechanic?.years_experience}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.smith@example.com"
                defaultValue={mechanic?.email || ""}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <SubmitButton isEdit={!!mechanic} />
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

