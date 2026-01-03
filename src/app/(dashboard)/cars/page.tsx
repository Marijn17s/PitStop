import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { getCarsPaginated, searchCarsPaginated } from "@/lib/db/queries/cars";

const PAGE_SIZE = 10;

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const page = Math.max(1, isNaN(currentPage) ? 1 : currentPage);

  const result = params.q
    ? await searchCarsPaginated(params.q, page, PAGE_SIZE)
    : await getCarsPaginated(page, PAGE_SIZE);

  const { cars, total, totalPages } = result;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cars</h1>
          <p className="text-slate-500 mt-1">Manage your vehicle inventory</p>
        </div>
        <Link href="/cars/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Car
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <form className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="q"
              placeholder="Search by brand, model, or owner..."
              defaultValue={params.q}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>
      </Card>

      {cars.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No cars found</h3>
            <p className="text-slate-500 mb-6">
              {params.q 
                ? "Try adjusting your search terms"
                : "Get started by adding your first car"}
            </p>
            {!params.q && (
              <Link href="/cars/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Car
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
                      <th className="text-left p-4 font-semibold text-slate-900">Brand</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Model</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Year</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Color</th>
                      <th className="text-left p-4 font-semibold text-slate-900">License Plate</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Owner</th>
                      <th className="text-right p-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((car) => (
                      <tr
                        key={car.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 font-medium text-slate-900">{car.brand}</td>
                        <td className="p-4 text-slate-700">{car.model}</td>
                        <td className="p-4 text-slate-700">{car.year}</td>
                        <td className="p-4">
                          <Badge variant="outline">{car.color}</Badge>
                        </td>
                        <td className="p-4 font-mono text-sm text-slate-700">
                          {car.license_plate || "-"}
                        </td>
                        <td className="p-4 text-slate-700">{car.owner || "-"}</td>
                        <td className="p-4 text-right">
                          <Link href={`/cars/${car.id}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:hidden">
            {cars.map((car) => (
              <Link key={car.id} href={`/cars/${car.id}`}>
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">
                        {car.brand} {car.model}
                      </h3>
                      <p className="text-sm text-slate-500">{car.year}</p>
                    </div>
                    <Badge variant="outline">{car.color}</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    {car.license_plate && (
                      <p className="text-slate-600 font-mono">
                        <span className="text-slate-500">Plate:</span> {car.license_plate}
                      </p>
                    )}
                    {car.owner && (
                      <p className="text-slate-600">
                        <span className="text-slate-500">Owner:</span> {car.owner}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}

      {cars.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-slate-500 text-center sm:text-left">
              Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} {total === 1 ? "car" : "cars"}
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl="/cars"
              searchParams={{ q: params.q }}
            />
          </div>
        </>
      )}
    </div>
  );
}

