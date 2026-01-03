"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { X, Car, Wrench, Calendar, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cars", href: "/cars", icon: Car },
  { name: "Mechanics", href: "/mechanics", icon: Wrench },
  { name: "Services", href: "/services", icon: Calendar },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();

  if (!open) {
    return null;
  }

  return (
    <Dialog as="div" className="relative z-50 lg:hidden" open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-slate-900/80" />
      <div className="fixed inset-0 flex">
        <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
          <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
            <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 px-6 py-4">
            <div className="flex h-16 shrink-0 items-center gap-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden relative">
                <Image
                  src="/favicon.ico"
                  alt="PitStop"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-slate-100">PitStop</span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul className="-mx-2 space-y-1">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            onClick={onClose}
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
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

