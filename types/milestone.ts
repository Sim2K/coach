export interface Milestone {
  milestone_id: string;
  fk_goals: string;
  milestone_date: string;
  milestone_content: string;
  milestone_description: string;
  target_date: string;
  achieved: boolean;
  achievement_date: string | null;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
  review_needed?: boolean;
  review_previous_milestone?: Partial<Milestone>;
}
