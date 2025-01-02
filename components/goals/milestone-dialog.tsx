"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Milestone } from "@/types/milestone";

interface MilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: Milestone | null;
  goalId: string;
  goalTargetDate?: string;
  onMilestoneChange: () => void;
  onMilestoneAdded?: () => void;
  previousMilestoneData: {
    milestone_description: string;
    target_date: string;
    achieved: boolean;
    achievement_date: string | null;
  } | null;
}

export function MilestoneDialog({
  open,
  onOpenChange,
  milestone,
  goalId,
  goalTargetDate,
  onMilestoneChange,
  onMilestoneAdded,
  previousMilestoneData,
}: MilestoneDialogProps) {
  const [formData, setFormData] = useState({
    milestone_description: "",
    target_date: "",
    achieved: false,
    achievement_date: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(false); // Optional: Loading state

  useEffect(() => {
    if (milestone) {
      setFormData({
        milestone_description: milestone.milestone_description,
        target_date: milestone.target_date,
        achieved: milestone.achieved,
        achievement_date: milestone.achievement_date,
      });
    } else {
      setFormData({
        milestone_description: "",
        target_date: "",
        achieved: false,
        achievement_date: null,
      });
    }
  }, [milestone]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate target date against goal target date
      if (goalTargetDate && formData.target_date) {
        const milestoneDate = new Date(formData.target_date + 'T23:59:59');
        const goalDate = new Date(goalTargetDate + 'T23:59:59');
        
        // Set time to end of day for fair comparison
        milestoneDate.setUTCHours(23, 59, 59, 999);
        goalDate.setUTCHours(23, 59, 59, 999);
        
        if (milestoneDate.getTime() > goalDate.getTime()) {
          toast.error("Milestone target date cannot be later than the goal target date");
          setIsLoading(false);
          return;
        }
      }

      if (milestone) {
        // Update existing milestone
        const updatePayload: any = {
          milestone_description: formData.milestone_description,
          target_date: formData.target_date,
          achieved: formData.achieved,
          achievement_date: formData.achievement_date,
          last_updated: new Date().toISOString(),
        };

        // Only store backup if review_needed is false
        if (!milestone.review_needed && previousMilestoneData) {
          updatePayload.review_previous_milestone = previousMilestoneData;
          updatePayload.review_needed = true;
          toast.info("This milestone update has been flagged for review with Ajay in your next AI session.", {
            duration: 10000,
            description: "Changes will be discussed and reviewed during the session."
          });
        }

        const { error: updateError } = await supabase
          .from("milestones")
          .update(updatePayload)
          .eq("milestone_id", milestone.milestone_id);

        if (updateError) throw updateError;
        toast.success("Milestone updated successfully");
      } else {
        // Create new milestone
        const { error } = await supabase
          .from("milestones")
          .insert([
            {
              milestone_description: formData.milestone_description,
              target_date: formData.target_date,
              achieved: formData.achieved,
              achievement_date: formData.achievement_date,
              goal_id: goalId,
              review_needed: true,
            },
          ]);

        if (error) throw error;
        toast.success("Milestone created successfully");
        toast.info("This new milestone has been flagged for review with Ajay in your next AI session.", {
          duration: 10000,
          description: "The milestone will be discussed and reviewed during the session."
        });
        if (onMilestoneAdded) onMilestoneAdded();
      }

      onMilestoneChange();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error saving milestone");
    } finally {
      setIsLoading(false); // Optional: Reset loading state
    }
  }, [
    milestone,
    formData,
    goalId,
    onMilestoneChange,
    onOpenChange,
    previousMilestoneData,
    onMilestoneAdded,
    goalTargetDate,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {milestone ? "Edit Milestone" : "Create New Milestone"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="milestone_description">Description</Label>
            <Textarea
              id="milestone_description"
              value={formData.milestone_description}
              onChange={(e) =>
                setFormData({ ...formData, milestone_description: e.target.value })
              }
              placeholder="Enter milestone description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) =>
                setFormData({ ...formData, target_date: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achieved">Achieved</Label>
            <Switch
              id="achieved"
              checked={formData.achieved}
              onCheckedChange={(checked) => {
                setFormData({
                  ...formData,
                  achieved: checked,
                  achievement_date: checked ? new Date().toISOString() : null,
                });
              }}
            />
          </div>
          {formData.achieved && (
            <div className="space-y-2">
              <Label htmlFor="achievement_date">Achievement Date</Label>
              <Input
                id="achievement_date"
                type="date"
                value={formData.achievement_date?.split("T")[0] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, achievement_date: e.target.value })
                }
              />
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {milestone ? "Update" : "Create"} Milestone
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
