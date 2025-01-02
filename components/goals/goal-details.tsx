"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
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

export function GoalDetails({ goal, onUpdate, onToggleMaximize, isMaximized, onBack }: GoalDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [counts, setCounts] = useState({
    milestones: goal.milestones?.[0]?.count ?? 0,
    updates: goal.updates?.[0]?.count ?? 0,
    engagements: goal.engagements?.[0]?.count ?? 0,
    feedback: goal.feedback?.[0]?.count ?? 0
  });
  const [formData, setFormData] = useState({
    goal_description: goal.goal_description,
    goal_type: goal.goal_type || "",
    target_date: goal.target_date || "",
    progress: goal.progress || 0,
    effort_level: goal.effort_level || 3,
    is_completed: goal.is_completed || false,
    goal_title: goal.goal_title || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previousGoalData, setPreviousGoalData] = useState<{
    goal_description: string;
    goal_type: string;
    target_date: string;
    progress: number;
    is_completed: boolean;
    effort_level: number;
    goal_title: string;
  } | null>(null);

  useEffect(() => {
    setFormData({
      goal_description: goal.goal_description,
      goal_type: goal.goal_type || "",
      target_date: goal.target_date || "",
      progress: goal.progress || 0,
      effort_level: goal.effort_level || 3,
      is_completed: goal.is_completed || false,
      goal_title: goal.goal_title || "",
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

    if (!formData.goal_title.trim()) {
      toast.error("Title cannot be empty");
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
        goal_title: formData.goal_title,
      };

      // Only store backup if review_needed is false
      if (!goal.review_needed && previousGoalData) {
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

      setIsEditing(false);
      onUpdate();
      setPreviousGoalData(null);
      toast.success("Goal updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Error updating goal");
    } finally {
      setIsLoading(false);
    }
  }, [formData, goal, onUpdate, previousGoalData]);

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
              <div>
                <Label htmlFor="goal-title" className="text-base font-semibold">Goal Title</Label>
                <Input
                  id="goal-title"
                  value={formData.goal_title || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, goal_title: e.target.value })
                  }
                  placeholder="Enter goal title"
                  className="mt-2"
                />
                {formData.goal_title?.trim() === '' && (
                  <p className="text-sm text-red-500 mt-1">Title is required</p>
                )}
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

            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
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