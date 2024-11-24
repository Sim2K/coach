"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { UpdatesList } from "@/components/updates/updates-list";
import { UpdateDetails } from "@/components/updates/update-details";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Update } from "@/types/update";

export default function UpdatesPage() {
  const router = useRouter();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);

  const fetchUpdates = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("updates")
        .select(`
          *,
          goals:fk_goal (goal_description),
          milestones:fk_milestone (milestone_description)
        `)
        .eq("user_id", session.user.id)
        .order('update_date', { ascending: false });

      if (error) throw error;
      setUpdates(data);
      if (data.length > 0 && !selectedUpdate) {
        setSelectedUpdate(data[0]);
      }
    } catch (error) {
      toast.error("Error loading updates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex">
        {!isMaximized && (
          <div className="w-1/3 border-r border-gray-200 bg-white p-6">
            <UpdatesList 
              updates={updates} 
              selectedUpdate={selectedUpdate}
              onSelectUpdate={setSelectedUpdate}
              onUpdateCreated={fetchUpdates}
            />
          </div>
        )}
        
        <div className={`${isMaximized ? 'w-full' : 'w-2/3'} p-6`}>
          {selectedUpdate ? (
            <UpdateDetails 
              update={selectedUpdate} 
              onUpdate={fetchUpdates}
              onToggleMaximize={() => setIsMaximized(!isMaximized)}
              isMaximized={isMaximized}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select an update to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}