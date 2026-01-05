import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, Car as CarIcon, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServiceWithDetails } from "@/lib/db/queries/services";
import { DeleteServiceButton } from "@/components/services/delete-service-button";
import { formatDate, formatDateTime, formatStatus } from "@/lib/date-utils";

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getServiceWithDetails(parseInt(id));

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Service Details</h1>
          <p className="text-slate-500 mt-1">Complete information about this service</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/services/${service.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteServiceButton serviceId={service.id} />
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Service Information</CardTitle>
              <Badge 
                className={`${statusColors[service.status as keyof typeof statusColors]} text-sm`}
                variant="secondary"
              >
                {formatStatus(service.status)}
              </Badge>
            </div>
            <CardDescription>Basic details about this service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Start Date</p>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  {formatDateTime(service.start_date)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">End Date</p>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  {service.end_date ? formatDateTime(service.end_date) : "Not completed"}
                </p>
              </div>
            </div>
            {service.notes && (
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">Notes</p>
                <p className="text-base text-slate-700 bg-slate-50 p-4 rounded-lg">
                  {service.notes}
                </p>
              </div>
            )}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Created on {formatDate(service.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CarIcon className="h-5 w-5 text-blue-600" />
                <CardTitle>Vehicle</CardTitle>
              </div>
              <CardDescription>Information about the serviced car</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/cars/${service.car.id}`} className="block group">
                <div className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                  <h2 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600">
                    {service.car.brand} {service.car.model}
                  </h2>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p>Year: {service.car.year}</p>
                    <p>Color: {service.car.color}</p>
                    {service.car.license_plate && (
                      <p className="font-mono">Plate: {service.car.license_plate}</p>
                    )}
                    {service.car.owner && (
                      <p>Owner: {service.car.owner}</p>
                    )}
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-green-600" />
                <CardTitle>Assigned Mechanics</CardTitle>
              </div>
              <CardDescription>Team members working on this service</CardDescription>
            </CardHeader>
            <CardContent>
              {service.mechanics.length === 0 ? (
                <p className="text-sm text-slate-500">No mechanics assigned</p>
              ) : (
                <div className="space-y-2">
                  {service.mechanics.map((mechanic) => (
                    <Link 
                      key={mechanic.id}
                      href={`/mechanics/${mechanic.id}`}
                      className="block p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                    >
                      <p className="font-medium text-slate-900">
                        {mechanic.first_name} {mechanic.last_name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {mechanic.years_experience} {mechanic.years_experience === 1 ? 'year' : 'years'} experience
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

