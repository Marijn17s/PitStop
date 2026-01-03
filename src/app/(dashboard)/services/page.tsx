import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllServices } from "@/lib/db/queries/services";
import { getAllCars } from "@/lib/db/queries/cars";
import { formatDate, formatStatus } from "@/lib/date-utils";

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const [allServices, cars] = await Promise.all([
    getAllServices(),
    getAllCars()
  ]);

  const services = params.status
    ? allServices.filter(s => s.status === params.status)
    : allServices;

  const carMap = new Map(cars.map(car => [car.id, car]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Services</h1>
          <p className="text-slate-500 mt-1">Manage vehicle maintenance and repairs</p>
        </div>
        <Link href="/services/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Service
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <form className="flex gap-2">
          <Select name="status" defaultValue={params.status || "all"}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" variant="outline">Filter</Button>
        </form>
      </Card>

      {services.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No services found</h3>
            <p className="text-slate-500 mb-6">
              {params.status 
                ? "No services match the selected filter"
                : "Get started by scheduling your first service"}
            </p>
            {!params.status && (
              <Link href="/services/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Your First Service
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <>
          <div className="hidden lg:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-4 font-semibold text-slate-900">Car</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Start Date</th>
                      <th className="text-left p-4 font-semibold text-slate-900">End Date</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Status</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Notes</th>
                      <th className="text-right p-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => {
                      const car = carMap.get(service.car_id);
                      return (
                        <tr
                          key={service.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4 font-medium text-slate-900">
                            {car ? `${car.brand} ${car.model}` : 'Unknown'}
                          </td>
                          <td className="p-4 text-slate-700">
                            {formatDate(service.start_date)}
                          </td>
                          <td className="p-4 text-slate-700">
                            {service.end_date ? formatDate(service.end_date) : "-"}
                          </td>
                          <td className="p-4">
                            <Badge 
                              className={statusColors[service.status as keyof typeof statusColors]}
                              variant="secondary"
                            >
                              {formatStatus(service.status)}
                            </Badge>
                          </td>
                          <td className="p-4 text-slate-700 max-w-xs truncate">
                            {service.notes || "-"}
                          </td>
                          <td className="p-4 text-right">
                            <Link href={`/services/${service.id}`}>
                              <Button variant="outline" size="sm">View Details</Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:hidden">
            {services.map((service) => {
              const car = carMap.get(service.car_id);
              return (
                <Link key={service.id} href={`/services/${service.id}`}>
                  <Card className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">
                          {car ? `${car.brand} ${car.model}` : 'Unknown'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {formatDate(service.start_date)}
                        </p>
                      </div>
                      <Badge 
                        className={statusColors[service.status as keyof typeof statusColors]}
                        variant="secondary"
                      >
                        {formatStatus(service.status)}
                      </Badge>
                    </div>
                    {service.notes && (
                      <p className="text-sm text-slate-600 line-clamp-2">{service.notes}</p>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {services.length > 0 && (
        <p className="text-sm text-slate-500 text-center">
          Showing {services.length} {services.length === 1 ? "service" : "services"}
        </p>
      )}
    </div>
  );
}

