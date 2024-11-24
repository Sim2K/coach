"use client";

import { Button } from "@/components/ui/button";
import { Clock, PlusCircle, RefreshCw } from "lucide-react";
import { NewUpdateDialog } from "./new-update-dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Update } from "@/types/update";

interface UpdatesListProps {
  updates: Update[];
  selectedUpdate: Update | null;
  onSelectUpdate: (update: Update) => void;
  onUpdateCreated: () => void;
}

export function UpdatesList({ updates, selectedUpdate, onSelectUpdate, onUpdateCreated }: UpdatesListProps) {
  const [showNewUpdate, setShowNewUpdate] = useState(false);

  const getUpdateTypeColor = (type?: string) => {
    if (!type) return 'bg-gray-100 text-gray-800';
    
    const colors: { [key: string]: string } = {
      'progress': 'bg-blue-100 text-blue-800',
      'milestone': 'bg-green-100 text-green-800',
      'goal': 'bg-purple-100 text-purple-800',
      'status': 'bg-yellow-100 text-yellow-800',
      'feedback': 'bg-pink-100 text-pink-800'
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Updates</h2>
        <Button size="sm" onClick={() => setShowNewUpdate(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Update
        </Button>
      </div>

      <div className="space-y-4">
        {updates.map((update) => (
          <div
            key={update.update_id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors relative ${
              selectedUpdate?.update_id === update.update_id
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-purple-200"
            }`}
            onClick={() => onSelectUpdate(update)}
          >
            <div className="flex justify-between items-start mb-2">
              <Badge className={getUpdateTypeColor(update.update_type)}>
                {update.update_type}
              </Badge>
              {update.reverted && (
                <Badge variant="outline" className="border-orange-500 text-orange-500">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reverted
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{update.update_description}</p>
            
            {(update.goals?.goal_description || update.milestones?.milestone_description) && (
              <p className="text-xs text-gray-500 mb-2">
                Related to: {update.goals?.goal_description || update.milestones?.milestone_description}
              </p>
            )}
            
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(update.update_date).toLocaleString()}
              {update.source && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {update.source}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      <NewUpdateDialog 
        open={showNewUpdate} 
        onOpenChange={setShowNewUpdate}
        onUpdateCreated={() => {
          onUpdateCreated();
          setShowNewUpdate(false);
        }}
      />
    </div>
  );
}