"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UserIcon,
  Settings,
  Target,
  Crosshair,
  MessageSquare,
  Activity,
  Flag,
  Bell,
  Heart,
  LogOut,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./mobile-menu";

export const menuItems = [
  { name: "Profile", href: "/profile", Icon: UserIcon },
  { name: "Update Key", href: "/update-key", Icon: Key },
  { name: "Goals", href: "/goals", Icon: Target },
  { name: "Frameworks", href: "/soon-come", Icon: Crosshair },
  { name: "Settings", href: "/settings", Icon: Settings },
  { name: "Updates", href: "/updates", Icon: Bell },
  { name: "Preferences", href: "/soon-come", Icon: Heart },
];

export function Sidebar() {
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
    <>
      <MobileMenu />
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 min-h-screen flex-col relative">
        <div className="p-4">
          <div className="flex items-center mb-8 px-2">
            <Crosshair className="h-6 w-6 text-purple-600 mr-2" />
            <span className="text-xl font-bold">Ajay Accountability Life Coach by Veedence.co.uk</span>
          </div>
          
          <nav className="space-y-1 pb-20">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-purple-50 text-purple-600"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <item.Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="fixed bottom-0 w-64 bg-white border-t border-gray-200 p-4">
          <Link
            href="https://GPTs4u.com/lifecoach"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full px-4 py-3 mb-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <MessageSquare className="h-5 w-5 mr-3" />
            Let's talk!
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
}