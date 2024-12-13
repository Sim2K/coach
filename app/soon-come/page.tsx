"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Clock } from "lucide-react";

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
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 md:ml-0 ml-16">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] text-center p-4 md:p-6 space-y-4">
            <Clock className="w-12 h-12 md:w-16 md:h-16 text-purple-600 animate-pulse" />
            <h1 className="text-2xl md:text-3xl font-bold text-purple-600">Hold tight!</h1>
            <p className="text-xl md:text-2xl text-purple-600">Soon come!</p>
            <p className="text-sm md:text-base text-gray-500 max-w-md">
              We're working on something exciting. Check back soon for updates!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
