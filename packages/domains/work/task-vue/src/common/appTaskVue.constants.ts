import type { TaskCategory, TaskPriority, TaskStatus } from '@ferdy/extern-task';
import type { StatusFilter } from './appTaskVue.types';

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'Todo',
  'in-progress': 'In Progress',
  done: 'Done',
};

export const STATUS_ICON: Record<TaskStatus, string> = {
  todo: 'icon-circle',
  'in-progress': 'icon-clock',
  done: 'icon-check-circle-2',
};

export const CATEGORY_LABEL: Record<TaskCategory, string> = {
  work: 'Work',
  personal: 'Personal',
  study: 'Study',
  idea: 'Idea',
};

export const CATEGORY_ICON: Record<TaskCategory, string> = {
  work: 'icon-briefcase',
  personal: 'icon-user',
  study: 'icon-book-open',
  idea: 'icon-lightbulb',
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const STATUS_FILTER_OPTIONS: readonly { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export const CATEGORY_OPTIONS: readonly TaskCategory[] = [
  'work',
  'personal',
  'study',
  'idea',
];

export const PRIORITY_OPTIONS: readonly TaskPriority[] = ['high', 'medium', 'low'];
