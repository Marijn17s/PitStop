"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Car, Wrench, Calendar, LayoutDashboard } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cars", href: "/cars", icon: Car },
  { name: "Mechanics", href: "/mechanics", icon: Wrench },
  { name: "Services", href: "/services", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-700 bg-slate-900 px-6 py-4">
        <div className="flex h-16 shrink-0 items-center gap-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src="/favicon.ico"
              alt="PitStop"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-2xl font-bold text-slate-100">PitStop</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 transition-colors",
                          isActive
                            ? "bg-blue-900/50 text-blue-400"
                            : "text-slate-300 hover:text-blue-400 hover:bg-slate-800"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-6 w-6 shrink-0",
                            isActive ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400"
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

