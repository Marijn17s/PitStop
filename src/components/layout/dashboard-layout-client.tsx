"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <MobileNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Sidebar />
      <div className="lg:pl-64">
        <Navbar 
          user={user} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

