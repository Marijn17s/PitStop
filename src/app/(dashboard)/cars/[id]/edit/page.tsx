import { notFound } from "next/navigation";
import { CarForm } from "@/components/cars/car-form";
import { getCarById } from "@/lib/db/queries/cars";
import { updateCarAction } from "@/actions/cars";

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCarById(parseInt(id));

  if (!car) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Car</h1>
        <p className="text-slate-500 mt-1">
          Update the information for {car.brand} {car.model}
        </p>
      </div>
      <CarForm 
        car={car} 
        action={updateCarAction.bind(null, car.id)} 
      />
    </div>
  );
}

