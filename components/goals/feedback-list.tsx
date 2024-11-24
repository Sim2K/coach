"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, MessageSquare, AlertTriangle, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Feedback } from "@/types/feedback";

const getFeedbackIcon = (type: string) => {
  const icons = {
    "positive": <CheckCircle className="h-5 w-5 text-green-500" />,
    "negative": <AlertTriangle className="h-5 w-5 text-red-500" />,
    "neutral": <MessageSquare className="h-5 w-5 text-blue-500" />,
    "warning": <AlertCircle className="h-5 w-5 text-yellow-500" />,
    "suggestion": <HelpCircle className="h-5 w-5 text-purple-500" />
  };
  return icons[type as keyof typeof icons] || <MessageSquare className="h-5 w-5 text-gray-500" />;
};

export function FeedbackList({ goalId }: { goalId: string }) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("fk_goals", goalId)
        .order("feedback_date", { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error: unknown) {
      console.error('Error loading feedback:', error);
      toast.error("Error loading feedback");
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleDelete = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from("feedback")
        .delete()
        .eq("feedback_id", feedbackId);

      if (error) throw error;
      toast.success("Feedback deleted successfully");
      fetchFeedback();
    } catch (error: unknown) {
      console.error('Error deleting feedback:', error);
      toast.error("Error deleting feedback");
    }
  };

  if (loading) {
    return <div>Loading feedback...</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        {feedback.length === 0 ? (
          <p className="text-center text-gray-500">No feedback found</p>
        ) : (
          <div className="space-y-4">
            {feedback.map((item: Feedback) => (
              <div
                key={item.feedback_id}
                className="p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    {getFeedbackIcon(item.feedback_type)}
                    <span className="text-sm font-medium text-gray-600">
                      {item.feedback_type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {new Date(item.feedback_date).toLocaleDateString()}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this feedback? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.feedback_id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {item.action_taken && (
                  <div className="mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {item.action_taken}
                    </h4>
                  </div>
                )}
                <p className="text-gray-600 text-sm">{item.feedback_content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}