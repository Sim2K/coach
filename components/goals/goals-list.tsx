"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, CheckCircle2, Calendar } from "lucide-react";
import { NewGoalDialog } from "./new-goal-dialog";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Goal } from "@/types/goal";
import { ActivityGuard } from "@/lib/auth/activityGuard";
import { getDateBasedColor } from "@/lib/utils/date-colors";
import { cn } from "@/lib/utils";

interface GoalsListProps {
  goals: Goal[];
  selectedGoal: Goal | null;
  onSelectGoal: (goal: Goal) => void;
  onGoalCreated: () => void;
}

const getEffortLevelColor = (level: number) => {
  const colors = {
    1: "#22c55e",
    2: "#86efac",
    3: "#fbbf24",
    4: "#fb923c",
    5: "#ef4444",
  };
  return colors[level as keyof typeof colors] || colors[3];
};

export function GoalsList({ goals, selectedGoal, onSelectGoal, onGoalCreated }: GoalsListProps) {
  const [showNewGoal, setShowNewGoal] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Goals</h2>
        <ActivityGuard action="create" type="goal">
          <Button size="sm" onClick={() => setShowNewGoal(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </ActivityGuard>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.goal_id}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-colors relative",
              getDateBasedColor(goal.target_date, selectedGoal?.goal_id === goal.goal_id),
              selectedGoal?.goal_id === goal.goal_id
                ? "border-purple-500"
                : "border-gray-200 hover:border-purple-200"
            )}
            onClick={() => onSelectGoal(goal)}
          >
            {goal.is_completed && (
              <span className="absolute -top-4 -right-2 text-xl">🎉</span>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="absolute top-2 right-2 w-8 h-8 rounded-full border border-black flex items-center justify-center"
                    style={{ backgroundColor: getEffortLevelColor(goal.effort_level) }}
                  >
                    <span className="text-black font-medium">{goal.effort_level}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is the effort level for this goal</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <h3 className="font-medium mb-1 pr-10">{goal.goal_title}</h3>
            {goal.target_date && (
              <div className="flex items-center gap-1 mb-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{new Date(goal.target_date).toLocaleDateString()}</span>
              </div>
            )}
            <div className="border border-gray-200 rounded-full">
              <Progress value={goal.progress} className="h-2 mb-2" />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{goal.progress}% complete</span>
              <div className="flex gap-3">
                <span>{goal.milestones?.[0]?.count ?? 0} milestones</span>
                <span>{goal.updates?.[0]?.count ?? 0} updates</span>
                <span>{goal.engagements?.[0]?.count ?? 0} engagements</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <NewGoalDialog 
        open={showNewGoal} 
        onOpenChange={setShowNewGoal}
        onGoalCreated={() => {
          onGoalCreated();
          setShowNewGoal(false);
        }}
      />
    </div>
  );
}