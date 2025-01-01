"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && window.location.pathname === '/auth/login') {
        router.push("/profile");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}