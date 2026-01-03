"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Car, Mechanic, Service, ServiceWithDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ServiceFormProps {
  service?: ServiceWithDetails;
  cars: Car[];
  mechanics: Mechanic[];
  action: (formData: FormData) => Promise<any>;
  preselectedCarId?: number;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700">
      {pending ? "Saving..." : isEdit ? "Update Service" : "Create Service"}
    </Button>
  );
}

export function ServiceForm({ service, cars, mechanics, action, preselectedCarId }: ServiceFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedMechanics, setSelectedMechanics] = useState<number[]>(
    service?.mechanics.map(m => m.id) || []
  );
  const [selectedCar, setSelectedCar] = useState<string>(
    service?.car_id.toString() || preselectedCarId?.toString() || ""
  );
  const [status, setStatus] = useState<Service["status"]>(
    service?.status || "scheduled"
  );

  const handleStatusChange = (value: string) => {
    setStatus(value as Service["status"]);
  };

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    if (selectedMechanics.length === 0) {
      setError("Please select at least one mechanic");
      return;
    }
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
    }
  };

  const toggleMechanic = (mechanicId: number) => {
    setSelectedMechanics(prev =>
      prev.includes(mechanicId)
        ? prev.filter(id => id !== mechanicId)
        : [...prev, mechanicId]
    );
  };

  const formatDateForInput = (date: Date | string) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service ? "Edit Service" : "Schedule New Service"}</CardTitle>
        <CardDescription>
          {service ? "Update the service details below" : "Enter the details for the new service"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="carId">Car *</Label>
            <Select name="carId" value={selectedCar} onValueChange={setSelectedCar} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a car" />
              </SelectTrigger>
              <SelectContent>
                {cars.map((car) => (
                  <SelectItem key={car.id} value={car.id.toString()}>
                    {car.brand} {car.model} ({car.year}) {car.license_plate && `- ${car.license_plate}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                defaultValue={service ? formatDateForInput(service.start_date) : ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                defaultValue={service?.end_date ? formatDateForInput(service.end_date) : ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select name="status" value={status} onValueChange={handleStatusChange} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assigned Mechanics * (Select at least one)</Label>
            <Card className="p-4">
              <div className="space-y-3">
                {mechanics.length === 0 ? (
                  <p className="text-sm text-slate-500">No mechanics available</p>
                ) : (
                  mechanics.map((mechanic) => (
                    <div key={mechanic.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mechanic-${mechanic.id}`}
                        checked={selectedMechanics.includes(mechanic.id)}
                        onCheckedChange={() => toggleMechanic(mechanic.id)}
                      />
                      <input
                        type="hidden"
                        name="mechanicIds"
                        value={mechanic.id}
                        disabled={!selectedMechanics.includes(mechanic.id)}
                      />
                      <label
                        htmlFor={`mechanic-${mechanic.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {mechanic.first_name} {mechanic.last_name} ({mechanic.years_experience} years exp.)
                      </label>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional information about this service..."
              defaultValue={service?.notes || ""}
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <SubmitButton isEdit={!!service} />
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

