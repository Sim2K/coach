"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, CheckCircle2, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MilestoneDialog } from "./milestone-dialog";
import { CompletionDialog } from "@/components/ui/completion-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Milestone } from "@/types/milestone";

export function MilestonesList({ goalId }: { goalId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [completingMilestone, setCompletingMilestone] = useState<Milestone | null>(null);
  const [previousMilestoneData, setPreviousMilestoneData] = useState<{
    milestone_description: string;
    target_date: string;
    achieved: boolean;
    achievement_date: string | null;
  } | null>(null);

  const fetchMilestones = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("goal_id", goalId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMilestones(data);
    } catch (error) {
      toast.error("Error loading milestones");
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const handleEdit = useCallback((milestone: Milestone) => {
    if (!milestone.review_previous_milestone) {
      const capturedData = {
        milestone_description: milestone.milestone_description,
        target_date: milestone.target_date,
        achieved: milestone.achieved,
        achievement_date: milestone.achievement_date,
      };
      setPreviousMilestoneData(capturedData);
    }
    setSelectedMilestone(milestone);
    setShowDialog(true);
  }, []);

  const handleComplete = useCallback(async (milestone: Milestone) => {
    try {
      const { error } = await supabase
        .from("milestones")
        .update({
          achieved: true,
          achievement_date: new Date().toISOString(),
          review_needed: true,
        })
        .eq("milestone_id", milestone.milestone_id);

      if (error) throw error;
      fetchMilestones();
      toast.success("Milestone completed!");
    } catch (error: any) {
      toast.error(error.message || "Error completing milestone");
    }
  }, [fetchMilestones]);

  const handleDelete = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from("milestones")
        .delete()
        .eq("milestone_id", milestoneId);

      if (error) throw error;
      toast.success("Milestone deleted successfully");
      fetchMilestones();
    } catch (error) {
      toast.error("Error deleting milestone");
    }
  };

  if (loading) {
    return <div>Loading milestones...</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Milestones</h3>
          <Button
            size="sm"
            onClick={() => {
              setSelectedMilestone(null);
              setShowDialog(true);
              setPreviousMilestoneData(null);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Milestone
          </Button>
        </div>

        {milestones.length === 0 ? (
          <p className="text-center text-gray-500">No milestones found</p>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.milestone_id}
                className="p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{milestone.milestone_description}</h3>
                    {milestone.achieved && (
                      <span className="text-xl">🎉</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(milestone)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!milestone.achieved && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-500 hover:text-green-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCompletingMilestone(milestone);
                                setShowCompletionDialog(true);
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Complete this Milestone</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this milestone? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(milestone.milestone_id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Target Date: {new Date(milestone.target_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span>Status: </span>
                    <span className={`ml-1 ${milestone.achieved ? 'text-green-500' : 'text-yellow-500'}`}>
                      {milestone.achieved ? 'Achieved' : 'Pending'}
                    </span>
                  </div>
                  {milestone.achievement_date && (
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                      <span>Completed: {new Date(milestone.achievement_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <MilestoneDialog
          open={showDialog}
          onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) {
              setPreviousMilestoneData(null);
            }
          }}
          milestone={selectedMilestone}
          goalId={goalId}
          onMilestoneChange={fetchMilestones}
          previousMilestoneData={previousMilestoneData}
        />

        <CompletionDialog
          open={showCompletionDialog}
          onOpenChange={setShowCompletionDialog}
          onConfirm={() => {
            if (completingMilestone) {
              handleComplete(completingMilestone);
              setCompletingMilestone(null);
            }
          }}
        />
      </CardContent>
    </Card>
  );
}