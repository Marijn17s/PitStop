import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllMechanics, searchMechanics } from "@/lib/db/queries/mechanics";

export default async function MechanicsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const mechanics = params.q 
    ? await searchMechanics(params.q)
    : await getAllMechanics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mechanics</h1>
          <p className="text-slate-500 mt-1">Manage your service team</p>
        </div>
        <Link href="/mechanics/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Mechanic
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <form className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="q"
              placeholder="Search by name or email..."
              defaultValue={params.q}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>
      </Card>

      {mechanics.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No mechanics found</h3>
            <p className="text-slate-500 mb-6">
              {params.q 
                ? "Try adjusting your search terms"
                : "Get started by adding your first mechanic"}
            </p>
            {!params.q && (
              <Link href="/mechanics/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Mechanic
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
                      <th className="text-left p-4 font-semibold text-slate-900">Name</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Experience</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Email</th>
                      <th className="text-right p-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mechanics.map((mechanic) => (
                      <tr
                        key={mechanic.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 font-medium text-slate-900">
                          {mechanic.first_name} {mechanic.last_name}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {mechanic.years_experience} {mechanic.years_experience === 1 ? 'year' : 'years'}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-700">{mechanic.email || "-"}</td>
                        <td className="p-4 text-right">
                          <Link href={`/mechanics/${mechanic.id}`}>
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
            {mechanics.map((mechanic) => (
              <Link key={mechanic.id} href={`/mechanics/${mechanic.id}`}>
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">
                        {mechanic.first_name} {mechanic.last_name}
                      </h3>
                      <Badge variant="outline" className="mt-2">
                        {mechanic.years_experience} {mechanic.years_experience === 1 ? 'year' : 'years'}
                      </Badge>
                    </div>
                  </div>
                  {mechanic.email && (
                    <p className="text-sm text-slate-600">{mechanic.email}</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}

      {mechanics.length > 0 && (
        <p className="text-sm text-slate-500 text-center">
          Showing {mechanics.length} {mechanics.length === 1 ? "mechanic" : "mechanics"}
        </p>
      )}
    </div>
  );
}

