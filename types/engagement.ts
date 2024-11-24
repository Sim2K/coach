import { ReactNode } from "react";

export interface Engagement {
  interaction_type: ReactNode;
  engagement_id: string;
  fk_goals: string;
  interaction_date: string;
  sentiment: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
