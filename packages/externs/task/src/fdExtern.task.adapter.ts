import { createInitialSeedTasks } from './fdExtern.task.seed';
import type {
  CreateTaskInput,
  TaskChangeListener,
  TaskExternService,
  TaskItem,
  UpdateTaskPatch,
} from './fdExtern.task.type';
import {
  applyTaskPatch,
  buildNewTaskItem,
  cloneTasks,
  generateTaskId,
  getNextTaskStatus,
  isValidTaskItem,
} from './fdExtern.task.util';

const STORAGE_KEY = 'ferdy:extern:tasks';
const BROADCAST_CHANNEL_NAME = 'ferdy:extern:task';

interface SyncBroadcastMessage {
  type: 'TASKS_UPDATED';
  senderId: string;
  timestamp: number;
}

function getLocalStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * `localStorage` 영속화와 `BroadcastChannel` 창 간 실시간 동기화를 수행하는 `TaskExternService` 구현체를 생성합니다.
 */
export function createLocalStorageTaskAdapter(): TaskExternService {
  const instanceId = generateTaskId('extern');
  const listeners = new Set<TaskChangeListener>();

  let memoryFallbackTasks: TaskItem[] | null = null;
  let broadcastChannel: BroadcastChannel | null = null;
  let isSyncInitialized = false;

  function getBroadcastChannel(): BroadcastChannel | null {
    if (broadcastChannel) return broadcastChannel;
    if (typeof BroadcastChannel === 'undefined') return null;

    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    return broadcastChannel;
  }

  function writeTasksToStorage(tasks: readonly TaskItem[]): TaskItem[] {
    const snapshot = cloneTasks(tasks);
    memoryFallbackTasks = snapshot;

    const storage = getLocalStorage();
    if (storage) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // 스토리지 용량 제한 또는 접근 불가 시 메모리 폴백 스냅샷을 유지합니다.
      }
    }

    return cloneTasks(snapshot);
  }

  function readTasksFromStorage(): TaskItem[] {
    const storage = getLocalStorage();
    if (!storage) {
      if (!memoryFallbackTasks) {
        memoryFallbackTasks = createInitialSeedTasks();
      }
      return cloneTasks(memoryFallbackTasks);
    }

    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) {
      return writeTasksToStorage(createInitialSeedTasks());
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.every(isValidTaskItem)) {
        return writeTasksToStorage(createInitialSeedTasks());
      }
      const normalized = cloneTasks(parsed);
      memoryFallbackTasks = normalized;
      return cloneTasks(normalized);
    } catch {
      return writeTasksToStorage(createInitialSeedTasks());
    }
  }

  function notifyListeners(tasks: readonly TaskItem[]): void {
    listeners.forEach((listener) => {
      listener(cloneTasks(tasks));
    });
  }

  function ensureCrossWindowSync(): void {
    if (isSyncInitialized) return;
    isSyncInitialized = true;

    const channel = getBroadcastChannel();
    if (channel) {
      channel.addEventListener('message', (event: MessageEvent<unknown>) => {
        const data = event.data as Partial<SyncBroadcastMessage> | null;
        if (!data || data.type !== 'TASKS_UPDATED') return;
        if (data.senderId === instanceId) return;

        notifyListeners(readTasksFromStorage());
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return;
        notifyListeners(readTasksFromStorage());
      });
    }
  }

  function persistAndBroadcast(tasks: readonly TaskItem[]): TaskItem[] {
    const snapshot = writeTasksToStorage(tasks);
    notifyListeners(snapshot);

    const channel = getBroadcastChannel();
    if (channel) {
      const message: SyncBroadcastMessage = {
        type: 'TASKS_UPDATED',
        senderId: instanceId,
        timestamp: Date.now(),
      };
      channel.postMessage(message);
    }

    return snapshot;
  }

  async function updateTask(
    id: string,
    patch: UpdateTaskPatch
  ): Promise<TaskItem> {
    const current = readTasksFromStorage();
    const index = current.findIndex((task) => task.id === id);
    if (index === -1) {
      throw new Error(`Task not found: ${id}`);
    }

    const updated = applyTaskPatch(current[index], patch);
    const nextTasks = [...current];
    nextTasks[index] = updated;
    persistAndBroadcast(nextTasks);

    return { ...updated };
  }

  ensureCrossWindowSync();

  return {
    async listTasks(): Promise<TaskItem[]> {
      return readTasksFromStorage();
    },

    async createTask(input: CreateTaskInput): Promise<TaskItem> {
      const created = buildNewTaskItem(input);
      const current = readTasksFromStorage();
      persistAndBroadcast([created, ...current]);
      return { ...created };
    },

    updateTask,

    async cycleTaskStatus(id: string): Promise<TaskItem> {
      const current = readTasksFromStorage();
      const target = current.find((task) => task.id === id);
      if (!target) {
        throw new Error(`Task not found: ${id}`);
      }

      return updateTask(id, {
        status: getNextTaskStatus(target.status),
      });
    },

    async deleteTask(id: string): Promise<void> {
      const current = readTasksFromStorage();
      const nextTasks = current.filter((task) => task.id !== id);
      if (nextTasks.length === current.length) return;

      persistAndBroadcast(nextTasks);
    },

    async resetToSeed(): Promise<TaskItem[]> {
      return persistAndBroadcast(createInitialSeedTasks());
    },

    subscribe(listener: TaskChangeListener): () => void {
      ensureCrossWindowSync();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
