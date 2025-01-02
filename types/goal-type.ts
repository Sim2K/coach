export const GOAL_TYPES = ['Personal', 'Career', 'Professional'] as const;
export type GoalType = typeof GOAL_TYPES[number];
