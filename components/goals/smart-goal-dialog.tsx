"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface SmartGoal {
  smart_id: string;
  specific: string | null;
  measurable: string | null;
  achievable: string | null;
  relevant: string | null;
  time_bound?: string | null;
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
}

interface SmartGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  smartGoal: SmartGoal | null;
  onSmartGoalChange: () => void;
  previousSmartGoalData?: Partial<SmartGoal> | null;
}

const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'On Hold', label: 'On Hold' }
];

export function SmartGoalDialog({
  open,
  onOpenChange,
  goalId,
  smartGoal,
  onSmartGoalChange,
  previousSmartGoalData
}: SmartGoalDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    specific: "",
    measurable: "",
    achievable: "",
    relevant: "",
    status: "Pending" as SmartGoal['status']
  });

  useEffect(() => {
    if (smartGoal) {
      setFormData({
        specific: smartGoal.specific || "",
        measurable: smartGoal.measurable || "",
        achievable: smartGoal.achievable || "",
        relevant: smartGoal.relevant || "",
        status: smartGoal.status
      });
    } else {
      setFormData({
        specific: "",
        measurable: "",
        achievable: "",
        relevant: "",
        status: "Pending"
      });
    }
  }, [smartGoal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to continue");
        return;
      }

      if (smartGoal) {
        // Update existing SMART goal
        const updatePayload: any = {
          ...formData,
          review_needed: true,
        };

        if (previousSmartGoalData) {
          updatePayload.review_previous_smart = previousSmartGoalData;
        }

        const { error } = await supabase
          .from("smartgoals")
          .update(updatePayload)
          .eq("smart_id", smartGoal.smart_id);

        if (error) throw error;
        toast.success("SMART goal updated successfully");
      } else {
        // Create new SMART goal
        const { error } = await supabase
          .from("smartgoals")
          .insert([
            {
              ...formData,
              goal_id: goalId,
              user_id: session.user.id,
              review_needed: true
            }
          ]);

        if (error) throw error;
        toast.success("SMART goal created successfully");
      }

      onSmartGoalChange();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error saving SMART goal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">
            {smartGoal ? "Edit SMART Goal" : "Create SMART Goal"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Specific</Label>
                <Textarea
                  value={formData.specific}
                  onChange={(e) =>
                    setFormData({ ...formData, specific: e.target.value })
                  }
                  placeholder="What exactly do you want to accomplish?"
                  required
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Measurable</Label>
                <Textarea
                  value={formData.measurable}
                  onChange={(e) =>
                    setFormData({ ...formData, measurable: e.target.value })
                  }
                  placeholder="How will you track progress?"
                  required
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Achievable</Label>
                <Textarea
                  value={formData.achievable}
                  onChange={(e) =>
                    setFormData({ ...formData, achievable: e.target.value })
                  }
                  placeholder="Is this realistic with your resources?"
                  required
                  className="min-h-[120px] resize-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Relevant</Label>
                <Textarea
                  value={formData.relevant}
                  onChange={(e) =>
                    setFormData({ ...formData, relevant: e.target.value })
                  }
                  placeholder="Why is this important to your goals?"
                  required
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Pending' | 'In Progress' | 'Completed' | 'On Hold') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-10 px-6 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Saving..." : smartGoal ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
