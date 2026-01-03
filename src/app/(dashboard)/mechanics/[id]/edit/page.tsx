import { notFound } from "next/navigation";
import { MechanicForm } from "@/components/mechanics/mechanic-form";
import { getMechanicById } from "@/lib/db/queries/mechanics";
import { updateMechanicAction } from "@/actions/mechanics";

export default async function EditMechanicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mechanic = await getMechanicById(parseInt(id));

  if (!mechanic) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Mechanic</h1>
        <p className="text-slate-500 mt-1">
          Update the information for {mechanic.first_name} {mechanic.last_name}
        </p>
      </div>
      <MechanicForm 
        mechanic={mechanic} 
        action={updateMechanicAction.bind(null, mechanic.id)} 
      />
    </div>
  );
}

