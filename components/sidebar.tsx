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

const menuItems = [
  { name: "Profile", href: "/profile", Icon: UserIcon },
  { name: "Update Key", href: "/update-key", Icon: Key },
  { name: "Goals", href: "/goals", Icon: Target },
  { name: "Smart Goals", href: "/smart-goals", Icon: Crosshair },
  { name: "Feedback", href: "/feedback", Icon: MessageSquare },
  { name: "Engagement", href: "/engagement", Icon: Activity },
  { name: "Milestones", href: "/milestones", Icon: Flag },
  { name: "Settings", href: "/settings", Icon: Settings },
  { name: "Updates", href: "/updates", Icon: Bell },
  { name: "Preferences", href: "/preferences", Icon: Heart },
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
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 flex flex-col">
      <div className="flex items-center mb-8 px-2">
        <Crosshair className="h-6 w-6 text-purple-600 mr-2" />
        <span className="text-xl font-bold">Ajay Accountability Life Coach by Veedence.co.uk</span>
      </div>
      
      <nav className="space-y-1 flex-1">
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

      <Button
        variant="ghost"
        className="w-full justify-start mt-auto text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={handleSignOut}
      >
        <LogOut className="h-5 w-5 mr-3" />
        Sign Out
      </Button>
    </div>
  );
}