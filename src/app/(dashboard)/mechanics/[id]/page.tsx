import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMechanicById } from "@/lib/db/queries/mechanics";
import { getServicesByMechanicId } from "@/lib/db/queries/services";
import { DeleteMechanicButton } from "@/components/mechanics/delete-mechanic-button";
import { formatDate, formatStatus } from "@/lib/date-utils";

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default async function MechanicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [mechanic, services] = await Promise.all([
    getMechanicById(parseInt(id)),
    getServicesByMechanicId(parseInt(id))
  ]);

  if (!mechanic) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {mechanic.first_name} {mechanic.last_name}
          </h1>
          <p className="text-slate-500 mt-1">Mechanic details and service history</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/mechanics/${mechanic.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteMechanicButton mechanicId={mechanic.id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mechanic Information</CardTitle>
            <CardDescription>Basic details about this mechanic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">First Name</p>
                <p className="text-base font-semibold text-slate-900 mt-1">{mechanic.first_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Last Name</p>
                <p className="text-base font-semibold text-slate-900 mt-1">{mechanic.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Experience</p>
                <Badge variant="outline" className="mt-1">
                  {mechanic.years_experience} {mechanic.years_experience === 1 ? 'year' : 'years'}
                </Badge>
              </div>
              {mechanic.email && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="text-base text-slate-900 mt-1 break-all">{mechanic.email}</p>
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Added on {formatDate(mechanic.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service History</CardTitle>
            <CardDescription>Services assigned to this mechanic</CardDescription>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">No services assigned yet</p>
                <p className="text-sm text-slate-400 mt-1">This mechanic hasn&apos;t been assigned to any services</p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <Link 
                    key={service.id}
                    href={`/services/${service.id}`}
                    className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {service.car.brand} {service.car.model}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(service.start_date)}
                        </p>
                      </div>
                      <Badge 
                        className={`ml-2 ${statusColors[service.status as keyof typeof statusColors]}`}
                        variant="secondary"
                      >
                        {formatStatus(service.status)}
                      </Badge>
                    </div>
                    {service.notes && (
                      <p className="text-xs text-slate-500 line-clamp-1">{service.notes}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

