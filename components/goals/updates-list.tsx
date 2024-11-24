"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Update } from "@/types/update";

export function UpdatesList({ goalId }: { goalId: string }) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpdates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("updates")
        .select("*")
        .eq("fk_goal", goalId)
        .order("update_date", { ascending: false });

      if (error) throw error;
      setUpdates(data);
    } catch (error) {
      toast.error("Error loading updates");
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const handleDelete = async (updateId: string) => {
    try {
      const { error } = await supabase
        .from("updates")
        .delete()
        .eq("update_id", updateId);

      if (error) throw error;
      toast.success("Update deleted successfully");
      fetchUpdates();
    } catch (error) {
      toast.error("Error deleting update");
    }
  };

  if (loading) {
    return <div>Loading updates...</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        {updates.length === 0 ? (
          <p className="text-center text-gray-500">No updates found</p>
        ) : (
          <div className="space-y-4">
            {updates.map((update: Update) => (
              <div
                key={update.update_id}
                className="p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{update.update_type}</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {new Date(update.update_date).toLocaleString()}
                      </span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                          <AlertDialogAction onClick={() => handleDelete(update.update_id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg">{update.notes}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}