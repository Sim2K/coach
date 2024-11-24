export interface Milestone {
  review_previous_milestone: any;
  milestone_description: any;
  target_date: any;
  achieved: any;
  achievement_date: any;
  milestone_id: string;
  fk_goals: string;
  milestone_date: string;
  milestone_content: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}
