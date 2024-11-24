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
    setIsLoading(true); // Optional: Set loading state

    try {
      if (milestone) {
        // Update existing milestone
        const updatePayload: any = {
          milestone_description: formData.milestone_description,
          target_date: formData.target_date,
          achieved: formData.achieved,
          achievement_date: formData.achievement_date,
          last_updated: new Date().toISOString(),
          review_needed: true,
        };

        // If previousMilestoneData is provided, include it
        if (previousMilestoneData) {
          updatePayload.review_previous_milestone = previousMilestoneData;
        }

        const { error } = await supabase
          .from("milestones")
          .update(updatePayload)
          .eq("milestone_id", milestone.milestone_id);

        if (error) throw error;
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
          <div>
            <Label htmlFor="milestone-description">Description</Label>
            <Textarea
              id="milestone-description"
              value={formData.milestone_description}
              onChange={(e) =>
                setFormData({ ...formData, milestone_description: e.target.value })
              }
              placeholder="Enter milestone description"
              required
              className="min-h-[120px] resize-y"
              rows={5}
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
              required
            />
          </div>
          <div className="flex items-center justify-between">
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
            <div>
              <Label htmlFor="achievement-date">Achievement Date</Label>
              <Input
                id="achievement-date"
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
