"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Update } from "@/types/update";

interface NewUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCreated: () => void;
}

export function NewUpdateDialog({ open, onOpenChange, onUpdateCreated }: NewUpdateDialogProps) {
  const [formData, setFormData] = useState({
    update_type: "",
    previous_value: "",
    new_value: "",
    update_reason: "",
    source: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to create an update");
        return;
      }

      const { error } = await supabase
        .from("updates")
        .insert([
          {
            ...formData,
            user_id: session.user.id,
          }
        ]);

      if (error) throw error;

      toast.success("Update created successfully");
      onUpdateCreated();
      setFormData({
        update_type: "",
        previous_value: "",
        new_value: "",
        update_reason: "",
        source: "",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Error creating update");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Update</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Update Type</Label>
            <Select
              value={formData.update_type}
              onValueChange={(value) => setFormData({ ...formData, update_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="goal">Goal</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Previous Value</Label>
            <Input
              value={formData.previous_value}
              onChange={(e) => setFormData({ ...formData, previous_value: e.target.value })}
              placeholder="Enter previous value"
            />
          </div>

          <div>
            <Label>New Value</Label>
            <Input
              value={formData.new_value}
              onChange={(e) => setFormData({ ...formData, new_value: e.target.value })}
              placeholder="Enter new value"
            />
          </div>

          <div>
            <Label>Update Reason</Label>
            <Input
              value={formData.update_reason}
              onChange={(e) => setFormData({ ...formData, update_reason: e.target.value })}
              placeholder="Enter reason for update"
            />
          </div>

          <div>
            <Label>Source</Label>
            <Input
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="Enter update source"
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter additional notes"
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Update</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}