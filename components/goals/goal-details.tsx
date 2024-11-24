"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Maximize2, Minimize2 } from "lucide-react";
import { CompletionDialog } from "@/components/ui/completion-dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { MilestonesList } from "./milestones-list";
import { UpdatesList } from "./updates-list";
import { EngagementsList } from "./engagements-list";
import { FeedbackList } from "./feedback-list";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Goal } from "@/types/goal";

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

interface GoalDetailsProps {
  goal: Goal;
  onUpdate: () => void;
  onToggleMaximize?: () => void;
  isMaximized?: boolean;
}

export function GoalDetails({ goal, onUpdate, onToggleMaximize, isMaximized }: GoalDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [formData, setFormData] = useState({
    goal_description: goal.goal_description,
    goal_type: goal.goal_type || "",
    target_date: goal.target_date || "",
    progress: goal.progress || 0,
    effort_level: goal.effort_level || 3,
    is_completed: goal.is_completed || false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previousGoalData, setPreviousGoalData] = useState<{
    goal_description: string;
    goal_type: string;
    target_date: string;
    progress: number;
    is_completed: boolean;
    effort_level: number;
  } | null>(null);

  useEffect(() => {
    setFormData({
      goal_description: goal.goal_description,
      goal_type: goal.goal_type || "",
      target_date: goal.target_date || "",
      progress: goal.progress || 0,
      effort_level: goal.effort_level || 3,
      is_completed: goal.is_completed || false,
    });
  }, [goal]);

  const handleComplete = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error: goalError } = await supabase
        .from("goals")
        .update({
          is_completed: true,
          progress: 100,
          review_needed: true,
        })
        .eq("goal_id", goal.goal_id);

      if (goalError) throw goalError;

      const { error: milestonesError } = await supabase
        .from("milestones")
        .update({
          achieved: true,
          achievement_date: new Date().toISOString(),
          review_needed: true,
        })
        .eq("goal_id", goal.goal_id);

      if (milestonesError) throw milestonesError;

      onUpdate();
      toast.success("Goal completed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error completing goal");
    } finally {
      setIsLoading(false);
      setShowCompletionDialog(false);
    }
  }, [goal.goal_id, onUpdate]);

  const handleUpdate = useCallback(async () => {
    if (!formData.goal_description.trim()) {
      toast.error("Description cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      let updatePayload: any = {
        goal_description: formData.goal_description,
        goal_type: formData.goal_type,
        target_date: formData.target_date,
        progress: formData.progress,
        effort_level: formData.effort_level,
        review_needed: true,
      };

      if (previousGoalData) {
        updatePayload.review_previous_goal = previousGoalData;
      }

      const { error } = await supabase
        .from("goals")
        .update(updatePayload)
        .eq("goal_id", goal.goal_id);

      if (error) throw error;

      setIsEditing(false);
      onUpdate();
      setPreviousGoalData(null);
      toast.success("Goal updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Error updating goal");
    } finally {
      setIsLoading(false);
    }
  }, [formData, goal.goal_id, onUpdate, previousGoalData]);

  const handleDelete = useCallback(async () => {
    const confirmation = window.confirm("Are you sure you want to delete this goal?");
    if (!confirmation) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("goal_id", goal.goal_id);

      if (error) throw error;

      onUpdate();
      toast.success("Goal deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Error deleting goal");
    } finally {
      setIsLoading(false);
    }
  }, [goal.goal_id, onUpdate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Goal Details</h2>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMaximize}
                className="mr-2"
              >
                {isMaximized ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </Button>
              <Button onClick={() => {
                if (!goal.review_previous_goal) {
                  const capturedData = {
                    goal_description: goal.goal_description,
                    goal_type: goal.goal_type || "",
                    target_date: goal.target_date || "",
                    progress: goal.progress || 0,
                    is_completed: goal.is_completed || false,
                    effort_level: goal.effort_level || 3,
                  };
                  setPreviousGoalData(capturedData);
                }
                setIsEditing(true);
              }}>
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isLoading}>
                Save
              </Button>
            </>
          )}
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            Delete
          </Button>
        </div>
      </div>

      <Card className={goal.is_completed ? "border-green-500 border-3" : ""}>
        <CardContent className="p-6 relative">
          {!goal.is_completed && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-green-500 hover:text-green-600"
                    onClick={() => setShowCompletionDialog(true)}
                    disabled={isLoading}
                  >
                    <CheckCircle2 className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Complete this Goal!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                value={formData.goal_description}
                onChange={(e) =>
                  setFormData({ ...formData, goal_description: e.target.value })
                }
                disabled={!isEditing || isLoading}
                className="min-h-[120px] resize-y"
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal-type">Type</Label>
                <Input
                  id="goal-type"
                  value={formData.goal_type}
                  onChange={(e) =>
                    setFormData({ ...formData, goal_type: e.target.value })
                  }
                  disabled={!isEditing || isLoading}
                />
              </div>
              <div>
                <Label htmlFor="target-date">Target Date</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) =>
                    setFormData({ ...formData, target_date: e.target.value })
                  }
                  disabled={!isEditing || isLoading}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Slider
                id="progress"
                min={0}
                max={100}
                step={5}
                value={[formData.progress]}
                onValueChange={(value) =>
                  setFormData({ ...formData, progress: value[0] })
                }
                disabled={!isEditing || isLoading}
                className="mt-2"
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.progress}%
              </div>
            </div>
            <div>
              <Label>Effort Level</Label>
              <div className="pt-2">
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[formData.effort_level]}
                  onValueChange={(value) =>
                    setFormData({ ...formData, effort_level: value[0] })
                  }
                  disabled={!isEditing || isLoading}
                  className="w-full"
                  style={{
                    background: getEffortLevelColor(formData.effort_level),
                  }}
                />
                <div className="flex justify-between mt-1 text-sm text-gray-500">
                  <span>1 Easy</span>
                  <span>2</span>
                  <span>3 Medium</span>
                  <span>4</span>
                  <span>5 Hard</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        onConfirm={handleComplete}
        isLoading={isLoading}
        message="Completing this Goal will auto complete all connected Milestones!"
      />

      <Tabs defaultValue="milestones" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="engagements">Engagements</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones">
          <MilestonesList goalId={goal.goal_id} />
        </TabsContent>

        <TabsContent value="updates">
          <UpdatesList goalId={goal.goal_id} />
        </TabsContent>

        <TabsContent value="engagements">
          <EngagementsList goalId={goal.goal_id} />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackList goalId={goal.goal_id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}