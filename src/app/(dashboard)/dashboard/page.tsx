import Link from "next/link";
import { Car, Wrench, Calendar, TrendingUp, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllCars } from "@/lib/db/queries/cars";
import { getAllMechanics } from "@/lib/db/queries/mechanics";
import { getRecentServices, getServiceCountByStatus } from "@/lib/db/queries/services";
import { formatDate, formatStatus } from "@/lib/date-utils";

async function getDashboardData() {
  const [cars, mechanics, recentServices, statusCounts] = await Promise.all([
    getAllCars(),
    getAllMechanics(),
    getRecentServices(5),
    getServiceCountByStatus(),
  ]);

  const activeServices = statusCounts.find(s => s.status === 'in_progress')?.count || 0;

  return {
    totalCars: cars.length,
    totalMechanics: mechanics.length,
    activeServices,
    recentServices,
  };
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default async function DashboardPage() {
  const { totalCars, totalMechanics, activeServices, recentServices } = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Welcome back! Here&apos;s an overview of your car maintenance operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Cars</CardTitle>
            <Car className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalCars}</div>
            <p className="text-xs text-slate-500 mt-1">
              Registered vehicles
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Services</CardTitle>
            <Calendar className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{activeServices}</div>
            <p className="text-xs text-slate-500 mt-1">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Mechanics</CardTitle>
            <Wrench className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalMechanics}</div>
            <p className="text-xs text-slate-500 mt-1">
              Available staff
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Recent Activity</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{recentServices.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              Last 5 services
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/cars/new">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add New Car
              </Button>
            </Link>
            <Link href="/services/new">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Service
              </Button>
            </Link>
            <Link href="/mechanics/new">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Mechanic
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Services</CardTitle>
            <CardDescription>Latest service activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentServices.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No services yet</p>
                <p className="text-sm mt-1">Schedule your first service to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentServices.map((service) => (
                  <Link 
                    key={service.id} 
                    href={`/services/${service.id}`}
                    className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
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

