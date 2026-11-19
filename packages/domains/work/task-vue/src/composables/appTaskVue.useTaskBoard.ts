import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ferdyBridge } from '@ferdy/bridge';
import { taskExternService, type TaskItem } from '@ferdy/extern-task';
import type {
  CategoryFilter,
  CreateTaskPayload,
  StatusFilter,
  TaskCounts,
} from '../common/appTaskVue.types';

/** Task Board 상태 구독, 필터링 및 CRUD 액션을 관리하는 Composable. */
export function useTaskBoard() {
  const tasks = ref<TaskItem[]>([]);
  const isLoading = ref(true);
  const isBusy = ref(false);

  const statusFilter = ref<StatusFilter>('all');
  const categoryFilter = ref<CategoryFilter>('all');
  const searchQuery = ref('');

  let isMounted = true;
  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    isMounted = true;

    taskExternService
      .listTasks()
      .then((initialTasks) => {
        if (!isMounted) return;
        tasks.value = initialTasks;
      })
      .finally(() => {
        if (!isMounted) return;
        isLoading.value = false;
      });

    unsubscribe = taskExternService.subscribe((nextTasks) => {
      if (!isMounted) return;
      tasks.value = nextTasks;
    });
  });

  onUnmounted(() => {
    isMounted = false;
    unsubscribe?.();
    unsubscribe = null;
  });

  const counts = computed<TaskCounts>(() => {
    let todo = 0;
    let inProgress = 0;
    let done = 0;

    for (const task of tasks.value) {
      if (task.status === 'todo') todo += 1;
      else if (task.status === 'in-progress') inProgress += 1;
      else if (task.status === 'done') done += 1;
    }

    return {
      all: tasks.value.length,
      todo,
      'in-progress': inProgress,
      done,
    };
  });

  const filteredTasks = computed(() => {
    const normalizedQuery = searchQuery.value.trim().toLowerCase();

    return tasks.value.filter((task) => {
      if (statusFilter.value !== 'all' && task.status !== statusFilter.value) {
        return false;
      }
      if (categoryFilter.value !== 'all' && task.category !== categoryFilter.value) {
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
  });

  const compareWithReact = () => {
    ferdyBridge.openWindow({
      appId: 'work-task-react',
      title: 'Task Board (React)',
      appUrl: '/domains/work/task-react/',
    });
  };

  const createTask = async (payload: CreateTaskPayload): Promise<boolean> => {
    const trimmedTitle = payload.title.trim();
    if (!trimmedTitle || isBusy.value) return false;

    isBusy.value = true;
    try {
      await taskExternService.createTask({
        title: trimmedTitle,
        note: payload.note?.trim() || undefined,
        category: payload.category,
        priority: payload.priority,
      });
      return true;
    } finally {
      isBusy.value = false;
    }
  };

  const cycleStatus = async (id: string) => {
    await taskExternService.cycleTaskStatus(id);
  };

  const deleteTask = async (id: string) => {
    await taskExternService.deleteTask(id);
  };

  const resetSeed = async () => {
    if (isBusy.value) return;
    isBusy.value = true;
    try {
      await taskExternService.resetToSeed();
    } finally {
      isBusy.value = false;
    }
  };

  return {
    tasks,
    isLoading,
    isBusy,
    statusFilter,
    categoryFilter,
    searchQuery,
    counts,
    filteredTasks,
    compareWithReact,
    createTask,
    cycleStatus,
    deleteTask,
    resetSeed,
  };
}
