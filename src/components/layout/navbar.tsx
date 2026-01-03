"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  onMenuClick: () => void;
}

export function Navbar({ user, onMenuClick }: NavbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Needed to prevent hydration mismatch with DropdownMenu
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push("/login");
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-700 bg-slate-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-300 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>

      <div className="h-6 w-px bg-slate-700 lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden relative">
              <Image
                src="/favicon.ico"
                alt="PitStop"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-lg font-bold text-slate-100">PitStop</span>
          </div>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} disabled={isLoggingOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

