"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface NewGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated: () => void;
}

const getEffortLevelColor = (level: number) => {
  const colors = {
    1: "#22c55e", // green
    2: "#86efac", // light green
    3: "#fbbf24", // orange
    4: "#fb923c", // light red
    5: "#ef4444", // red
  };
  return colors[level as keyof typeof colors] || colors[3];
};

export function NewGoalDialog({ open, onOpenChange, onGoalCreated }: NewGoalDialogProps) {
  const [formData, setFormData] = useState({
    goal_title: "",
    goal_description: "",
    goal_type: "",
    target_date: "",
    effort_level: 3
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.goal_title.trim()) {
      toast.error("Goal title is required");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to create a goal");
        return;
      }

      const { error } = await supabase
        .from("goals")
        .insert([
          {
            ...formData,
            user_id: session.user.id,
            review_needed: true
          }
        ]);

      if (error) throw error;

      toast.success("Goal created successfully");
      toast.info("This new goal has been flagged for review with Ajay in your next AI session.", {
        duration: 10000,
        description: "The goal will be discussed and reviewed during the session."
      });
      onGoalCreated();
      setFormData({
        goal_title: "",
        goal_description: "",
        goal_type: "",
        target_date: "",
        effort_level: 3
      });
    } catch (error: any) {
      toast.error(error.message || "Error creating goal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={formData.goal_title}
              onChange={(e) =>
                setFormData({ ...formData, goal_title: e.target.value })
              }
              placeholder="Enter goal title"
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.goal_description}
              onChange={(e) =>
                setFormData({ ...formData, goal_description: e.target.value })
              }
              placeholder="Enter goal description"
              required
              className="min-h-[120px] resize-y"
              rows={5}
            />
          </div>
          <div>
            <Label>Type</Label>
            <Input
              value={formData.goal_type}
              onChange={(e) =>
                setFormData({ ...formData, goal_type: e.target.value })
              }
              placeholder="Enter goal type"
            />
          </div>
          <div>
            <Label>Target Date</Label>
            <Input
              type="date"
              value={formData.target_date}
              onChange={(e) =>
                setFormData({ ...formData, target_date: e.target.value })
              }
            />
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
                className="w-full"
                style={{
                  background: getEffortLevelColor(formData.effort_level)
                }}
              />
              <div className="flex justify-between mt-1 text-sm text-gray-500">
                <span>Easy</span>
                <span>Medium</span>
                <span>Hard</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}