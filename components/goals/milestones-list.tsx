"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, CheckCircle2, Trash2, Calendar, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MilestoneDialog } from "./milestone-dialog";
import { CompletionDialog } from "@/components/ui/completion-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Milestone } from "@/types/milestone";
import { cn } from "@/lib/utils";
import { ActivityGuard } from "@/lib/auth/activityGuard";

interface MilestonesListProps {
  goalId: string;
  goalTargetDate?: string;
}

export function MilestonesList({ goalId, goalTargetDate }: MilestonesListProps) {
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
        .order("target_date", { ascending: true });

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
      setShowCompletionDialog(false); // Close the dialog after success
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
          <ActivityGuard action="create" type="milestone">
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
          </ActivityGuard>
        </div>

        {milestones.length === 0 ? (
          <p className="text-center text-gray-500">No milestones found</p>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.milestone_id}
                className={(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const targetDate = new Date(milestone.target_date);
                  targetDate.setHours(0, 0, 0, 0);
                  const diffTime = targetDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  let bgColor = "bg-white";
                  if (!milestone.achieved) {
                    if (diffDays > 0 && diffDays <= 10) {
                      bgColor = "bg-orange-200";
                    } else if (diffDays <= 0) {
                      bgColor = "bg-red-200";
                    }
                  }

                  const finalClassName = cn(
                    "p-4 md:p-6 border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 relative",
                    bgColor
                  );

                  return finalClassName;
                })()}
              >
                {/* Add warning icon for milestone target date beyond goal target date */}
                {goalTargetDate && new Date(milestone.target_date) > new Date(goalTargetDate) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute bottom-2 left-2">
                          <AlertTriangle 
                            className="h-5 w-5 text-amber-500 animate-pulse" 
                            style={{ 
                              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                              opacity: '0.9'
                            }} 
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Milestone target date is beyond the goal target date. Please update the milestone target date.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-3">
                  <div className="flex items-start md:items-center space-x-2 w-full md:w-auto">
                    <h3 className="font-medium text-gray-900 break-words">{milestone.milestone_description}</h3>
                    {milestone.achieved && (
                      <span className="text-xl flex-shrink-0">🎉</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                    <ActivityGuard action="edit" type="milestone">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(milestone)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </ActivityGuard>
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
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>Target: {new Date(milestone.target_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span>Status: </span>
                    <span className={`ml-1 ${milestone.achieved ? 'text-green-500' : 'text-yellow-500'}`}>
                      {milestone.achieved ? 'Achieved' : 'Pending'}
                    </span>
                  </div>
                  {milestone.achievement_date && (
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1 text-green-500 flex-shrink-0" />
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
          goalTargetDate={goalTargetDate}
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