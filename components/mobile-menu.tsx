"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, LogOut, X } from "lucide-react";
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
    <div className="block md:hidden">
      {/* Mobile-only top bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="w-32 h-8 bg-[url('/images/svg/veedence_logo_wide.svg')] bg-contain bg-no-repeat bg-center" />
        
        <div className="w-10" />
      </div>

      {/* Full screen mobile menu overlay */}
      <div className={cn(
        "fixed inset-0 bg-white/95 backdrop-blur-sm z-50 transition-all duration-300",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        <div className="flex flex-col h-full pt-16">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
            <div className="w-32 h-8 bg-[url('/images/svg/veedence_logo_wide.svg')] bg-contain bg-no-repeat bg-center" />
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg transition-colors",
                    pathname === item.href
                      ? "bg-purple-50 text-purple-600"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <item.Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
