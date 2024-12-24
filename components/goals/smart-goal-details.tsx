"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SmartGoal {
  smart_id: string;
  specific: string | null;
  measurable: string | null;
  achievable: string | null;
  relevant: string | null;
  time_bound: string | null;
  smart_progress: number;
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

  if (!smartGoal) {
    return (
      <div className="mt-6 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 relative">
          <p className="text-gray-500 text-center">No SMART details available for this goal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">SMART Details</h3>
          <Badge className={getStatusColor(smartGoal.status)}>
            {smartGoal.status}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{smartGoal.smart_progress}%</span>
          </div>
          <Progress value={smartGoal.smart_progress} />
        </div>

        {/* SMART Criteria */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="specific">
            <AccordionTrigger>Specific</AccordionTrigger>
            <AccordionContent>
              {smartGoal.specific || "Not specified"}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="measurable">
            <AccordionTrigger>Measurable</AccordionTrigger>
            <AccordionContent>
              {smartGoal.measurable || "Not specified"}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="achievable">
            <AccordionTrigger>Achievable</AccordionTrigger>
            <AccordionContent>
              {smartGoal.achievable || "Not specified"}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="relevant">
            <AccordionTrigger>Relevant</AccordionTrigger>
            <AccordionContent>
              {smartGoal.relevant || "Not specified"}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="timeBound">
            <AccordionTrigger>Time Bound</AccordionTrigger>
            <AccordionContent>
              {smartGoal.time_bound ? new Date(smartGoal.time_bound).toLocaleDateString() : "Not specified"}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
