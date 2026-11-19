import type { TaskCategory, TaskPriority, TaskStatus } from '@ferdy/extern-task';

export type StatusFilter = 'all' | TaskStatus;
export type CategoryFilter = 'all' | TaskCategory;

export type TaskCounts = Record<StatusFilter, number>;

export interface CreateTaskPayload {
  title: string;
  note?: string;
  category: TaskCategory;
  priority: TaskPriority;
}
