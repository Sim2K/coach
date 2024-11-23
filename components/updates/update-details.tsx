"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Update {
  update_id: string;
  update_type: string;
  update_date: string;
  previous_value: string | null;
  new_value: string | null;
  update_reason: string | null;
  source: string | null;
  notes: string | null;
  update_title: string | null;
  reverted: boolean;
  revert_date: string | null;
  fk_goal: string | null;
  fk_milestone: string | null;
  goals?: { goal_description: string } | null;
  milestones?: { milestone_description: string } | null;
}

interface UpdateDetailsProps {
  update: Update;
  onUpdate: () => void;
  onToggleMaximize?: () => void;
  isMaximized?: boolean;
}

export function UpdateDetails({ update, onUpdate, onToggleMaximize, isMaximized }: UpdateDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    update_type: update.update_type,
    previous_value: update.previous_value || "",
    new_value: update.new_value || "",
    update_reason: update.update_reason || "",
    source: update.source || "",
    notes: update.notes || "",
    update_title: update.update_title || "",
  });

  const handleUpdate = async () => {
    if (!formData.update_type || !formData.notes || !formData.update_title) {
      toast.error("Title, type and notes are required");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("updates")
        .update({
          update_type: formData.update_type,
          previous_value: formData.previous_value,
          new_value: formData.new_value,
          update_reason: formData.update_reason,
          source: formData.source,
          notes: formData.notes,
          update_title: formData.update_title,
        })
        .eq("update_id", update.update_id);

      if (error) throw error;

      setIsEditing(false);
      onUpdate();
      toast.success("Update modified successfully");
    } catch (error: any) {
      toast.error(error.message || "Error updating record");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("updates")
        .update({
          reverted: true,
          revert_date: new Date().toISOString(),
        })
        .eq("update_id", update.update_id);

      if (error) throw error;

      onUpdate();
      toast.success("Update reverted successfully");
    } catch (error: any) {
      toast.error(error.message || "Error reverting update");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("updates")
        .delete()
        .eq("update_id", update.update_id);

      if (error) throw error;

      onUpdate();
      toast.success("Update deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Error deleting update");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Update Details</h2>
        <div className="flex items-center space-x-2">
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
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
              {!update.reverted && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Revert
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revert Update</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to revert this update? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRevert}>Revert</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isLoading}>
                Save Changes
              </Button>
            </>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Update</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this update? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold uppercase">PROGRESS UPDATE</h3>
              <div className="text-sm text-gray-500">
                {new Date(update.update_date).toLocaleString()}
              </div>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={formData.update_title}
                onChange={(e) => setFormData({ ...formData, update_title: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Previous Value</Label>
              <Input
                value={formData.previous_value}
                onChange={(e) => setFormData({ ...formData, previous_value: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>New Value</Label>
              <Input
                value={formData.new_value}
                onChange={(e) => setFormData({ ...formData, new_value: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Update Reason</Label>
              <Input
                value={formData.update_reason}
                onChange={(e) => setFormData({ ...formData, update_reason: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Source</Label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={!isEditing}
                className="min-h-[100px]"
              />
            </div>

            {(update.goals?.goal_description || update.milestones?.milestone_description) && (
              <div className="pt-4 border-t">
                <Label>Related Items</Label>
                <div className="space-y-2 mt-2">
                  {update.goals?.goal_description && (
                    <div className="text-sm">
                      <span className="font-medium">Goal:</span> {update.goals.goal_description}
                    </div>
                  )}
                  {update.milestones?.milestone_description && (
                    <div className="text-sm">
                      <span className="font-medium">Milestone:</span> {update.milestones.milestone_description}
                    </div>
                  )}
                </div>
              </div>
            )}

            {update.reverted && (
              <div className="pt-4 border-t">
                <Badge variant="outline" className="border-orange-500 text-orange-500">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reverted on {new Date(update.revert_date!).toLocaleString()}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}