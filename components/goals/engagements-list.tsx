"use client";

import { useCallback,useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Users, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Engagement } from "@/types/engagement";

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return <ThumbsUp className="h-4 w-4 text-green-500" />;
    case 'negative':
      return <ThumbsDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-gray-500" />;
  }
};

export function EngagementsList({ goalId }: { goalId: string }) {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEngagements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("engagement")
        .select("*")
        .eq("fk_goals", goalId)
        .order("interaction_date", { ascending: false });

      if (error) throw error;
      setEngagements(data);
    } catch (error) {
      toast.error("Error loading engagements");
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchEngagements();
  }, [fetchEngagements]);

  const handleDelete = async (engagementId: string) => {
    try {
      const { error } = await supabase
        .from("engagement")
        .delete()
        .eq("engagement_id", engagementId);

      if (error) throw error;
      toast.success("Engagement deleted successfully");
      fetchEngagements();
    } catch (error) {
      toast.error("Error deleting engagement");
    }
  };

  if (loading) {
    return <div>Loading engagements...</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        {engagements.length === 0 ? (
          <p className="text-center text-gray-500">No engagements found</p>
        ) : (
          <div className="space-y-4">
            {engagements.map((engagement: Engagement) => (
              <div
                key={engagement.engagement_id}
                className="p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-purple-500" />
                    <h3 className="font-medium text-gray-900">{engagement.interaction_type}</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {new Date(engagement.interaction_date).toLocaleString()}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Engagement</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this engagement? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(engagement.engagement_id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg mb-2">{engagement.notes}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Sentiment:</span>
                  {getSentimentIcon(engagement.sentiment)}
                  <span className="capitalize">{engagement.sentiment}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}