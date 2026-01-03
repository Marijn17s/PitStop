import { MechanicForm } from "@/components/mechanics/mechanic-form";
import { createMechanicAction } from "@/actions/mechanics";

export default function NewMechanicPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Add New Mechanic</h1>
        <p className="text-slate-500 mt-1">Add a new mechanic to your team</p>
      </div>
      <MechanicForm action={createMechanicAction} />
    </div>
  );
}

