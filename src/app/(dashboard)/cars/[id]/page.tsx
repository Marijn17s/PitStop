import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCarWithServices } from "@/lib/db/queries/cars";
import { DeleteCarButton } from "@/components/cars/delete-car-button";
import { formatDate, formatStatus } from "@/lib/date-utils";

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCarWithServices(parseInt(id));

  if (!car) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {car.brand} {car.model}
          </h1>
          <p className="text-slate-500 mt-1">Vehicle details and service history</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/cars/${car.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteCarButton carId={car.id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Car Information</CardTitle>
            <CardDescription>Basic details about this vehicle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Brand</p>
                <p className="text-base font-semibold text-slate-900 mt-1">{car.brand}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Model</p>
                <p className="text-base font-semibold text-slate-900 mt-1">{car.model}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Year</p>
                <p className="text-base font-semibold text-slate-900 mt-1">{car.year}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Color</p>
                <Badge variant="outline" className="mt-1">{car.color}</Badge>
              </div>
              {car.license_plate && (
                <div>
                  <p className="text-sm font-medium text-slate-500">License Plate</p>
                  <p className="text-base font-mono font-semibold text-slate-900 mt-1">
                    {car.license_plate}
                  </p>
                </div>
              )}
              {car.owner && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Owner</p>
                  <p className="text-base font-semibold text-slate-900 mt-1">{car.owner}</p>
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Added on {formatDate(car.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Service History</CardTitle>
                <CardDescription>All services for this vehicle</CardDescription>
              </div>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Link href={`/services/new?carId=${car.id}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {car.services.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">No services yet</p>
                <p className="text-sm text-slate-400 mt-1">Schedule the first service for this car</p>
              </div>
            ) : (
              <div className="space-y-3">
                {car.services.map((service) => (
                  <Link 
                    key={service.id}
                    href={`/services/${service.id}`}
                    className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {formatDate(service.start_date)}
                        </p>
                        {service.notes && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {service.notes}
                          </p>
                        )}
                      </div>
                      <Badge 
                        className={`ml-2 ${statusColors[service.status as keyof typeof statusColors]}`}
                        variant="secondary"
                      >
                        {formatStatus(service.status)}
                      </Badge>
                    </div>
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

