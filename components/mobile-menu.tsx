"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuItems } from "./sidebar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/auth/login");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <div className="md:hidden">
      {/* Icons-only bar when menu is closed */}
      <div className={cn(
        "fixed left-0 top-0 bottom-0 w-16 bg-white border-r border-gray-200 transition-transform duration-300 flex flex-col items-center",
        isOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        {/* Burger Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="mt-4 mb-8"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex flex-col items-center space-y-4 flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "p-2 rounded-lg transition-colors",
                pathname === item.href
                  ? "text-purple-600 bg-purple-50"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <item.Icon className="h-6 w-6" />
            </Link>
          ))}
        </div>
        <div className="mt-auto mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Full menu overlay when open */}
      <div className={cn(
        "fixed inset-y-0 left-0 bg-white z-40 transition-transform duration-300 w-64 border-r border-gray-200 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="pt-20 px-6 space-y-1 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors",
                pathname === item.href
                  ? "bg-purple-50 text-purple-600"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <item.Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </div>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-4 mx-6 mb-6"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
