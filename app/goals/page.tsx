"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { GoalsList } from "@/components/goals/goals-list";
import { GoalDetails } from "@/components/goals/goal-details";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Goal } from "@/types/goal";

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showDetailsOnMobile, setShowDetailsOnMobile] = useState(false);

  const fetchGoals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("goals")
        .select(`
          *,
          milestones:milestones(count)
        `)
        .eq("user_id", session.user.id);

      if (error) throw error;
      setGoals(data);
      if (data.length > 0 && !selectedGoal) {
        setSelectedGoal(data[0]);
        setShowDetailsOnMobile(false);
      }
    } catch (error) {
      toast.error("Error loading goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
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
      
      <div className="flex-1 flex md:ml-0 ml-16">
        <div className={`${showDetailsOnMobile ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-gray-200 bg-white p-4 md:p-6`}>
          <GoalsList 
            goals={goals} 
            selectedGoal={selectedGoal}
            onSelectGoal={(goal) => {
              setSelectedGoal(goal);
              setShowDetailsOnMobile(true);
            }}
            onGoalCreated={fetchGoals}
          />
        </div>
        
        <div className={`${!showDetailsOnMobile ? 'hidden md:block' : 'block'} w-full md:w-2/3 p-4 md:p-6`}>
          {selectedGoal ? (
            <GoalDetails 
              goal={selectedGoal} 
              onUpdate={fetchGoals}
              onToggleMaximize={() => setIsMaximized(!isMaximized)}
              isMaximized={isMaximized}
              onBack={() => setShowDetailsOnMobile(false)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a goal to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}