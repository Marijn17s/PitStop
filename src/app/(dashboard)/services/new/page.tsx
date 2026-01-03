import { ServiceForm } from "@/components/services/service-form";
import { getAllCars } from "@/lib/db/queries/cars";
import { getAllMechanics } from "@/lib/db/queries/mechanics";
import { createServiceAction } from "@/actions/services";

export default async function NewServicePage({
  searchParams,
}: {
  searchParams: Promise<{ carId?: string }>;
}) {
  const params = await searchParams;
  const [cars, mechanics] = await Promise.all([
    getAllCars(),
    getAllMechanics()
  ]);

  const preselectedCarId = params.carId ? parseInt(params.carId) : undefined;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Schedule New Service</h1>
        <p className="text-slate-500 mt-1">Create a new service appointment</p>
      </div>
      <ServiceForm 
        cars={cars} 
        mechanics={mechanics} 
        action={createServiceAction}
        preselectedCarId={preselectedCarId}
      />
    </div>
  );
}

