import { useCallback, useEffect, useMemo, useState } from 'react';
import { ferdyBridge } from '@ferdy/bridge';
import { taskExternService, type TaskItem } from '@ferdy/extern-task';
import type {
  CategoryFilter,
  CreateTaskPayload,
  StatusFilter,
  TaskCounts,
} from '../common/appTaskReact.types';

/** Task Board 상태 구독, 필터링 및 CRUD 액션을 관리하는 Hook. */
export function useTaskBoard() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    taskExternService
      .listTasks()
      .then((initialTasks) => {
        if (!isMounted) return;
        setTasks(initialTasks);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    const unsubscribe = taskExternService.subscribe((nextTasks) => {
      if (!isMounted) return;
      setTasks(nextTasks);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const counts = useMemo<TaskCounts>(() => {
    let todo = 0;
    let inProgress = 0;
    let done = 0;

    for (const task of tasks) {
      if (task.status === 'todo') todo += 1;
      else if (task.status === 'in-progress') inProgress += 1;
      else if (task.status === 'done') done += 1;
    }

    return {
      all: tasks.length,
      todo,
      'in-progress': inProgress,
      done,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== 'all' && task.category !== categoryFilter) {
        return false;
      }
      if (normalizedQuery) {
        const titleMatch = task.title.toLowerCase().includes(normalizedQuery);
        const noteMatch = (task.note ?? '').toLowerCase().includes(normalizedQuery);
        if (!titleMatch && !noteMatch) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, statusFilter, categoryFilter, searchQuery]);

  const compareWithVue = useCallback(() => {
    ferdyBridge.openWindow({
      appId: 'work-task-vue',
      title: 'Task Board (Vue)',
      appUrl: '/domains/work/task-vue/',
    });
  }, []);

  const createTask = useCallback(
    async (payload: CreateTaskPayload): Promise<boolean> => {
      const trimmedTitle = payload.title.trim();
      if (!trimmedTitle || isBusy) return false;

      setIsBusy(true);
      try {
        await taskExternService.createTask({
          title: trimmedTitle,
          note: payload.note?.trim() || undefined,
          category: payload.category,
          priority: payload.priority,
        });
        return true;
      } finally {
        setIsBusy(false);
      }
    },
    [isBusy],
  );

  const cycleStatus = useCallback(async (id: string) => {
    await taskExternService.cycleTaskStatus(id);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await taskExternService.deleteTask(id);
  }, []);

  const resetSeed = useCallback(async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await taskExternService.resetToSeed();
    } finally {
      setIsBusy(false);
    }
  }, [isBusy]);

  return {
    tasks,
    isLoading,
    isBusy,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    counts,
    filteredTasks,
    compareWithVue,
    createTask,
    cycleStatus,
    deleteTask,
    resetSeed,
  };
}
