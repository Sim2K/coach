"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function SoonComePage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <Card className="w-full">
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <h1 className="text-3xl font-bold text-purple-600">Hold tight! Soon come!</h1>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
