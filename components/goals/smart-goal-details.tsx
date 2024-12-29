"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SmartGoalDialog } from "./smart-goal-dialog";

interface SmartGoal {
  smart_id: string;
  specific: string | null;
  measurable: string | null;
  achievable: string | null;
  relevant: string | null;
  time_bound?: string | null;
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
}

interface SmartGoalDetailsProps {
  goalId: string;
  isEditing?: boolean;
  onUpdate?: () => void;
}

const getStatusColor = (status: string) => {
  const colors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'On Hold': 'bg-gray-100 text-gray-800'
  };
  return colors[status as keyof typeof colors] || colors['Pending'];
};

export function SmartGoalDetails({ goalId, isEditing, onUpdate }: SmartGoalDetailsProps) {
  const [smartGoal, setSmartGoal] = useState<SmartGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const fetchSmartGoal = async () => {
    try {
      const { data, error } = await supabase
        .from("smartgoals")
        .select("*")
        .eq("goal_id", goalId)
        .single();

      if (error && error.code !== 'PGRST116') { 
        throw error;
      }
      setSmartGoal(data);
    } catch (error: any) {
      console.error("Error fetching SMART goal:", error);
      if (error.code !== 'PGRST116') {
        toast.error("Error loading SMART details");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmartGoal();
  }, [goalId]);

  if (loading) {
    return (
      <div className="mt-6 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 relative">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="text-lg font-semibold">SMART Details</h3>
          <div className="flex items-center gap-2">
            {smartGoal && (
              <Badge className={getStatusColor(smartGoal.status)}>
                {smartGoal.status}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDialog(true)}
            >
              {smartGoal ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit SMART
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add SMART
                </>
              )}
            </Button>
          </div>
        </div>

        {smartGoal ? (
          <div className="space-y-6">
            {/* Specific and Measurable Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Specific */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-indigo-600 rounded-full" />
                  <h4 className="font-medium text-indigo-900">Specific</h4>
                </div>
                <div className="pl-4 ml-3 border-l-2 border-indigo-100 rounded">
                  <p className="text-gray-600">
                    {smartGoal.specific || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Measurable */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-blue-600 rounded-full" />
                  <h4 className="font-medium text-blue-900">Measurable</h4>
                </div>
                <div className="pl-4 ml-3 border-l-2 border-blue-100 rounded">
                  <p className="text-gray-600">
                    {smartGoal.measurable || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Achievable and Relevant Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Achievable */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-green-600 rounded-full" />
                  <h4 className="font-medium text-green-900">Achievable</h4>
                </div>
                <div className="pl-4 ml-3 border-l-2 border-green-100 rounded">
                  <p className="text-gray-600">
                    {smartGoal.achievable || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Relevant */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-orange-600 rounded-full" />
                  <h4 className="font-medium text-orange-900">Relevant</h4>
                </div>
                <div className="pl-4 ml-3 border-l-2 border-orange-100 rounded">
                  <p className="text-gray-600">
                    {smartGoal.relevant || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No SMART details available for this goal</p>
        )}

        <SmartGoalDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          goalId={goalId}
          smartGoal={smartGoal}
          onSmartGoalChange={fetchSmartGoal}
        />
      </div>
    </div>
  );
}
