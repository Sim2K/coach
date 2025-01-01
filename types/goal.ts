export type Goal = {
  goal_id: string;
  user_id: string;
  goal_description: string;
  goal_title: string;
  goal_type?: string;
  target_date?: string;
  milestones?: { count: number }[];
  updates?: { count: number }[];
  engagements?: { count: number }[];
  feedback?: { count: number }[];
  count?: number;
  progress: number;
  effort_level: number;
  is_completed: boolean;
  review_needed?: boolean;
  review_previous_goal?: Partial<Goal>;
};
