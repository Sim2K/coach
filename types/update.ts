export interface Update {
  update_id: string;
  user_id: string;
  update_description: string;
  update_date: string;
  fk_goal?: string;
  fk_milestone?: string;
  goals?: {
    goal_description: string;
  };
  milestones?: {
    milestone_description: string;
  };
  update_type?: string;
  previous_value?: string;
  new_value?: string;
  update_reason?: string;
  source?: string;
  notes?: string;
  reverted?: boolean;
  revert_date?: string;
  created_at?: string;
  updated_at?: string;
}
