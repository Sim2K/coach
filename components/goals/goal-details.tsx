"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ChevronLeft, Maximize2, Minimize2, ChevronDown } from "lucide-react";
import { CompletionDialog } from "@/components/ui/completion-dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { MilestonesList } from "./milestones-list";
import { UpdatesList } from "./updates-list";
import { EngagementsList } from "./engagements-list";
import { FeedbackList } from "./feedback-list";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Goal } from "@/types/goal";
import { SmartGoalDetails } from "./smart-goal-details";
import { ActivityGuard } from "@/lib/auth/activityGuard";
import { triggerCelebration } from "@/lib/utils/celebration";
import { GOAL_TYPES } from "@/types/goal-type";

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
  onBack?: () => void;
}

export function GoalDetails({ goal: initialGoal, onUpdate, onToggleMaximize, isMaximized, onBack }: GoalDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [goal, setGoal] = useState(initialGoal);
  const [formData, setFormData] = useState({
    goal_description: "",
    goal_type: "",
    target_date: "",
    progress: 0,
    effort_level: 3,
    goal_title: ""
  });
  const [counts, setCounts] = useState({
    milestones: goal.milestones?.[0]?.count ?? 0,
    updates: goal.updates?.[0]?.count ?? 0,
    engagements: goal.engagements?.[0]?.count ?? 0,
    feedback: goal.feedback?.[0]?.count ?? 0
  });
  const [previousGoalData, setPreviousGoalData] = useState<{
    goal_description: string;
    goal_type: string;
    target_date: string;
    progress: number;
    is_completed: boolean;
    effort_level: number;
    goal_title: string;
  } | null>(null);
  const [milestoneCount, setMilestoneCount] = useState({ total: 0, completed: 0 });
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  useEffect(() => {
    setGoal(initialGoal);
  }, [initialGoal]);

  useEffect(() => {
    setFormData({
      goal_description: goal.goal_description,
      goal_type: goal.goal_type || "",
      target_date: goal.target_date || "",
      progress: goal.progress || 0,
      effort_level: goal.effort_level || 3,
      goal_title: goal.goal_title || ""
    });
  }, [goal]);

  useEffect(() => {
    setCounts({
      milestones: goal.milestones?.[0]?.count ?? 0,
      updates: goal.updates?.[0]?.count ?? 0,
      engagements: goal.engagements?.[0]?.count ?? 0,
      feedback: goal.feedback?.[0]?.count ?? 0
    });
  }, [goal]);

  useEffect(() => {
    const fetchMilestoneCount = async () => {
      try {
        const { data: totalData, error: totalError } = await supabase
          .from("milestones")
          .select("milestone_id", { count: 'exact' })
          .eq("goal_id", goal.goal_id);

        const { data: completedData, error: completedError } = await supabase
          .from("milestones")
          .select("milestone_id", { count: 'exact' })
          .eq("goal_id", goal.goal_id)
          .eq("achieved", true);

        if (totalError || completedError) throw totalError || completedError;

        setMilestoneCount({
          total: totalData?.length || 0,
          completed: completedData?.length || 0
        });
      } catch (error: any) {
        console.error("Error fetching milestone counts:", error);
      }
    };

    fetchMilestoneCount();
  }, [goal.goal_id]);

  const refreshGoalData = async () => {
    try {
      const { data: updatedGoal, error } = await supabase
        .from("goals")
        .select("*")
        .eq("goal_id", goal.goal_id)
        .single();
        
      if (error) throw error;
      if (updatedGoal) {
        setGoal(updatedGoal);
        onUpdate();
      }
    } catch (error: any) {
      console.error("Error refreshing goal:", error);
    }
  };

  const handleComplete = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("goals")
        .update(formData)
        .eq("goal_id", goal.goal_id);

      if (error) throw error;
      toast.success("Goal updated successfully");
      await refreshGoalData();
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, goal.goal_id]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("goal_id", goal.goal_id);

      if (error) throw error;
      toast.success("Goal deleted successfully");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [goal.goal_id, onUpdate]);

  const handleCompleteGoal = async () => {
    if (milestoneCount.total > 0 && milestoneCount.completed < milestoneCount.total) {
      toast.error("All milestones must be completed before completing the goal");
      return;
    }

    const confirmation = window.confirm("Are you sure you want to mark this goal as complete?");
    if (!confirmation) return;

    setIsLoading(true);
    try {
      const updatePayload: any = {
        progress: 100.00,
        is_completed: true,
        last_updated: new Date().toISOString(),
        review_needed: true,
      };

      if (!goal.review_needed) {
        updatePayload.review_previous_goal = {
          goal_description: goal.goal_description,
          goal_type: goal.goal_type || "",
          target_date: goal.target_date || "",
          progress: goal.progress || 0,
          effort_level: goal.effort_level || 3,
          is_completed: goal.is_completed || false,
          goal_title: goal.goal_title || "",
        };
      }

      const { error } = await supabase
        .from("goals")
        .update(updatePayload)
        .eq("goal_id", goal.goal_id);

      if (error) throw error;

      await refreshGoalData();

      const randomTimes = Math.floor(Math.random() * 4) + 2;
      await triggerCelebration(randomTimes);

      toast.success("Goal completed successfully!");
      if (!goal.review_needed) {
        toast.info("This goal completion has been flagged for review with Ajay in your next AI session.", {
          duration: 10000,
          description: "The completion will be discussed and reviewed during the session."
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Error completing goal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = useCallback(async () => {
    if (!formData.goal_description.trim()) {
      toast.error("Goal description is required");
      return;
    }

    setIsLoading(true);
    try {
      const updatePayload: any = {
        ...formData,
        last_updated: new Date().toISOString(),
      };

      if (!goal.review_needed) {
        updatePayload.review_previous_goal = previousGoalData;
        updatePayload.review_needed = true;
        toast.info("This goal update has been flagged for review with Ajay in your next AI session.", {
          duration: 10000,
          description: "Changes will be discussed and reviewed during the session."
        });
      }

      const { error } = await supabase
        .from("goals")
        .update(updatePayload)
        .eq("goal_id", goal.goal_id);

      if (error) throw error;

      await refreshGoalData();
      setIsEditing(false);
      toast.success("Goal updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, goal, previousGoalData]);

  const startEditing = () => {
    // Capture current state before editing
    setPreviousGoalData({
      goal_description: goal.goal_description,
      goal_type: goal.goal_type || "",
      target_date: goal.target_date || "",
      progress: goal.progress || 0,
      effort_level: goal.effort_level || 3,
      is_completed: goal.is_completed || false,
      goal_title: goal.goal_title || ""
    });
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      {/* Menu */}
      <div className="hidden md:flex md:justify-between md:items-center md:mt-4">
        <div className="flex items-center">
          {onToggleMaximize && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMaximize}
            >
              {isMaximized ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <ActivityGuard action="edit" type="goal">
                <Button
                  onClick={startEditing}
                >
                  Edit Goal
                </Button>
              </ActivityGuard>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="outline"
                        onClick={handleCompleteGoal}
                        disabled={milestoneCount.total > 0 && milestoneCount.completed < milestoneCount.total}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Complete Goal
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {milestoneCount.total > 0 && milestoneCount.completed < milestoneCount.total
                      ? "All milestones must be completed before completing the goal"
                      : "Mark this goal as complete"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Delete Goal
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
              >
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Back button row */}
      {onBack && (
        <div className="sticky top-16 left-0 z-40 bg-white -mt-4 -mx-4 px-4 pt-4 pb-2 block md:hidden border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Actions - mobile view */}
      <div className="flex gap-2 mt-4 block md:hidden">
        {!isEditing ? (
          <>
            <ActivityGuard action="edit" type="goal">
              <Button
                className="flex-1"
                onClick={startEditing}
              >
                Edit Goal
              </Button>
            </ActivityGuard>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCompleteGoal}
                      disabled={milestoneCount.total > 0 && milestoneCount.completed < milestoneCount.total}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Complete Goal
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {milestoneCount.total > 0 && milestoneCount.completed < milestoneCount.total
                    ? "All milestones must be completed before completing the goal"
                    : "Mark this goal as complete"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
            >
              Delete Goal
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpdate}
            >
              Save Changes
            </Button>
          </>
        )}
      </div>

      {/* Title Edit Box */}
      {isEditing && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-6">
          <div className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal_title">Title</Label>
                <Input
                  id="goal_title"
                  value={formData.goal_title}
                  onChange={(e) =>
                    setFormData({ ...formData, goal_title: e.target.value })
                  }
                  disabled={!isEditing || isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal_description">Description</Label>
                <Textarea
                  id="goal_description"
                  value={formData.goal_description}
                  onChange={(e) =>
                    setFormData({ ...formData, goal_description: e.target.value })
                  }
                  disabled={!isEditing || isLoading}
                  rows={5}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title row */}
      <div className="flex flex-col mt-4 md:mt-0">
        {!isEditing ? (
          <h2 className="text-2xl font-bold text-gray-900">{goal.goal_title}</h2>
        ) : null}
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 relative">
          {/* Existing Goal Details Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal_description">Description</Label>
              <Textarea
                id="goal_description"
                value={formData.goal_description}
                onChange={(e) =>
                  setFormData({ ...formData, goal_description: e.target.value })
                }
                disabled={!isEditing || isLoading}
                className="min-h-[120px] resize-y"
                rows={5}
              />
            </div>

            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal_type">Type</Label>
                {isEditing ? (
                  <Select
                    value={formData.goal_type || ""}
                    onValueChange={(value) => setFormData({ ...formData, goal_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="goal_type"
                    value={goal.goal_type || ""}
                    disabled
                  />
                )}
              </div>

              <div className="space-y-2">
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
        </div>
      </div>

      <SmartGoalDetails 
        goalId={goal.goal_id}
        isEditing={isEditing}
        onUpdate={onUpdate}
      />

      <MilestonesList 
        goalId={goal.goal_id}
        goalTargetDate={goal.target_date || ''}
      />

      <CompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        onConfirm={handleComplete}
        isLoading={isLoading}
        message="Completing this Goal will auto complete all connected Milestones!"
      />

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="updates">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <span>Updates</span>
              <span className="text-sm text-gray-500">({counts.updates})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <UpdatesList goalId={goal.goal_id} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="engagements">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <span>Engagements</span>
              <span className="text-sm text-gray-500">({counts.engagements})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EngagementsList goalId={goal.goal_id} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="feedback">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <span>Feedback</span>
              <span className="text-sm text-gray-500">({counts.feedback})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <FeedbackList goalId={goal.goal_id} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}