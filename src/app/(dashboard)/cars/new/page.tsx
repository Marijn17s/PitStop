import { CarForm } from "@/components/cars/car-form";
import { createCarAction } from "@/actions/cars";

export default function NewCarPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Add New Car</h1>
        <p className="text-slate-500 mt-1">Add a new vehicle to your inventory</p>
      </div>
      <CarForm action={createCarAction} />
    </div>
  );
}

