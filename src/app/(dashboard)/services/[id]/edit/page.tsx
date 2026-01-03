import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/services/service-form";
import { getServiceWithDetails } from "@/lib/db/queries/services";
import { getAllCars } from "@/lib/db/queries/cars";
import { getAllMechanics } from "@/lib/db/queries/mechanics";
import { updateServiceAction } from "@/actions/services";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [service, cars, mechanics] = await Promise.all([
    getServiceWithDetails(parseInt(id)),
    getAllCars(),
    getAllMechanics()
  ]);

  if (!service) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Service</h1>
        <p className="text-slate-500 mt-1">
          Update the information for this service
        </p>
      </div>
      <ServiceForm 
        service={service}
        cars={cars}
        mechanics={mechanics}
        action={updateServiceAction.bind(null, service.id)} 
      />
    </div>
  );
}

