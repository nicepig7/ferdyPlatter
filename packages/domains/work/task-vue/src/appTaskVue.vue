<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ferdyBridge } from '@ferdy/bridge';
import {
  taskExternService,
  type TaskCategory,
  type TaskItem,
  type TaskPriority,
  type TaskStatus,
} from '@ferdy/extern-task';
import './appTaskVue.css';

type StatusFilter = 'all' | TaskStatus;
type CategoryFilter = 'all' | TaskCategory;

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'Todo',
  'in-progress': 'In Progress',
  done: 'Done',
};

const STATUS_ICON: Record<TaskStatus, string> = {
  todo: 'icon-circle',
  'in-progress': 'icon-clock',
  done: 'icon-check-circle-2',
};

const CATEGORY_LABEL: Record<TaskCategory, string> = {
  work: 'Work',
  personal: 'Personal',
  study: 'Study',
  idea: 'Idea',
};

const CATEGORY_ICON: Record<TaskCategory, string> = {
  work: 'icon-briefcase',
  personal: 'icon-user',
  study: 'icon-book-open',
  idea: 'icon-lightbulb',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const STATUS_FILTER_OPTIONS: readonly { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const CATEGORY_OPTIONS: readonly TaskCategory[] = [
  'work',
  'personal',
  'study',
  'idea',
];

const PRIORITY_OPTIONS: readonly TaskPriority[] = ['high', 'medium', 'low'];

function formatUpdatedAt(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const tasks = ref<TaskItem[]>([]);
const isLoading = ref(true);
const isBusy = ref(false);

// Quick Add Form state
const titleInput = ref('');
const noteInput = ref('');
const categoryInput = ref<TaskCategory>('work');
const priorityInput = ref<TaskPriority>('medium');

// Filter & Search state
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

const counts = computed(() => {
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

const handleCompareWithReact = () => {
  ferdyBridge.openWindow({
    appId: 'work-task-react',
    title: 'Task Board (React)',
    appUrl: '/domains/work/task-react/',
  });
};

const handleCreateTask = async () => {
  const trimmedTitle = titleInput.value.trim();
  if (!trimmedTitle || isBusy.value) return;

  isBusy.value = true;
  try {
    await taskExternService.createTask({
      title: trimmedTitle,
      note: noteInput.value.trim() || undefined,
      category: categoryInput.value,
      priority: priorityInput.value,
    });
    titleInput.value = '';
    noteInput.value = '';
  } finally {
    isBusy.value = false;
  }
};

const handleCycleStatus = async (id: string) => {
  await taskExternService.cycleTaskStatus(id);
};

const handleDeleteTask = async (id: string) => {
  await taskExternService.deleteTask(id);
};

const handleResetSeed = async () => {
  if (isBusy.value) return;
  isBusy.value = true;
  try {
    await taskExternService.resetToSeed();
  } finally {
    isBusy.value = false;
  }
};
</script>

<template>
  <div class="task-board">
    <header class="task-header">
      <div class="task-header-main">
        <div class="task-brand">
          <span class="task-brand-icon" aria-hidden="true">
            <i class="task-icon task-icon--lg icon-kanban"></i>
          </span>
          <h1 class="task-brand-title">Task Board</h1>
          <span class="task-fw-badge task-fw-badge--vue">Vue 3</span>
        </div>

        <div class="task-header-actions">
          <button
            type="button"
            class="task-compare-btn"
            title="React 19 Task Board 창을 열어 실시간 동기화 비교"
            @click="handleCompareWithReact"
          >
            <i class="task-icon icon-columns-2" aria-hidden="true"></i>
            <span>Compare with React</span>
          </button>
        </div>
      </div>

      <div class="task-summary-bar" aria-label="Task 요약 카운터">
        <span class="task-stat-pill">
          <span>Total</span>
          <strong>{{ counts.all }}</strong>
        </span>
        <span class="task-stat-pill task-stat-pill--todo">
          <span>Todo</span>
          <strong>{{ counts.todo }}</strong>
        </span>
        <span class="task-stat-pill task-stat-pill--progress">
          <span>In Progress</span>
          <strong>{{ counts['in-progress'] }}</strong>
        </span>
        <span class="task-stat-pill task-stat-pill--done">
          <span>Done</span>
          <strong>{{ counts.done }}</strong>
        </span>
      </div>
    </header>

    <form class="task-quick-add" @submit.prevent="handleCreateTask">
      <div class="task-quick-add-inputs">
        <input
          v-model="titleInput"
          type="text"
          class="task-input"
          placeholder="새 Task 제목 입력 (필수)..."
          aria-label="Task 제목"
          maxlength="120"
        />
        <input
          v-model="noteInput"
          type="text"
          class="task-input"
          placeholder="한 줄 메모 (선택)"
          aria-label="Task 메모"
          maxlength="200"
        />
      </div>

      <div class="task-quick-add-controls">
        <div class="task-quick-add-selects">
          <label class="task-field-group">
            <span class="task-field-label">Category</span>
            <select
              v-model="categoryInput"
              class="task-select"
              aria-label="분류 선택"
            >
              <option
                v-for="category in CATEGORY_OPTIONS"
                :key="category"
                :value="category"
              >
                {{ CATEGORY_LABEL[category] }}
              </option>
            </select>
          </label>

          <label class="task-field-group">
            <span class="task-field-label">Priority</span>
            <select
              v-model="priorityInput"
              class="task-select"
              aria-label="우선순위 선택"
            >
              <option
                v-for="priority in PRIORITY_OPTIONS"
                :key="priority"
                :value="priority"
              >
                {{ PRIORITY_LABEL[priority] }}
              </option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          class="task-add-btn"
          :disabled="!titleInput.trim() || isBusy"
        >
          <i class="task-icon icon-plus" aria-hidden="true"></i>
          <span>Add Task</span>
        </button>
      </div>
    </form>

    <section class="task-filter-bar" aria-label="필터 및 검색">
      <div class="task-filter-row">
        <div class="task-tabs" role="tablist" aria-label="상태 필터">
          <button
            v-for="option in STATUS_FILTER_OPTIONS"
            :key="option.value"
            type="button"
            role="tab"
            :aria-selected="statusFilter === option.value"
            :class="['task-tab', { 'is-active': statusFilter === option.value }]"
            @click="statusFilter = option.value"
          >
            <span>{{ option.label }}</span>
            <span class="task-tab-count">{{ counts[option.value] }}</span>
          </button>
        </div>

        <div class="task-filter-right">
          <div class="task-search-box">
            <i
              class="task-icon task-icon--sm task-search-icon icon-search"
              aria-hidden="true"
            ></i>
            <input
              v-model="searchQuery"
              type="text"
              class="task-search-input"
              placeholder="제목 / 메모 검색..."
              aria-label="키워드 검색"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="task-search-clear"
              aria-label="검색어 지우기"
              title="검색어 지우기"
              @click="searchQuery = ''"
            >
              <i class="task-icon task-icon--sm icon-x" aria-hidden="true"></i>
            </button>
          </div>

          <button
            type="button"
            class="task-reset-btn"
            :disabled="isBusy"
            title="초기 시드 데이터로 복원"
            @click="handleResetSeed"
          >
            <i class="task-icon task-icon--sm icon-rotate-ccw" aria-hidden="true"></i>
            <span>Reset Seed</span>
          </button>
        </div>
      </div>

      <div class="task-category-pills" role="group" aria-label="분류 필터">
        <button
          type="button"
          :class="['task-category-pill', { 'is-active': categoryFilter === 'all' }]"
          @click="categoryFilter = 'all'"
        >
          All
        </button>
        <button
          v-for="category in CATEGORY_OPTIONS"
          :key="category"
          type="button"
          :class="['task-category-pill', { 'is-active': categoryFilter === category }]"
          @click="categoryFilter = category"
        >
          {{ CATEGORY_LABEL[category] }}
        </button>
      </div>
    </section>

    <main class="task-list-container">
      <div v-if="isLoading" class="task-empty">
        <i class="task-icon task-empty-icon icon-list-todo" aria-hidden="true"></i>
        <p class="task-empty-title">Task 목록을 불러오는 중...</p>
      </div>

      <div v-else-if="filteredTasks.length === 0" class="task-empty">
        <i class="task-icon task-empty-icon icon-list-todo" aria-hidden="true"></i>
        <p class="task-empty-title">조건에 맞는 Task가 없습니다</p>
        <p class="task-empty-desc">
          새 Task를 추가하거나 필터·검색 조건을 조정해 보세요.
        </p>
      </div>

      <div v-else class="task-list">
        <article
          v-for="task in filteredTasks"
          :key="task.id"
          :class="['task-card', { 'is-done': task.status === 'done' }]"
        >
          <div class="task-card-main">
            <button
              type="button"
              :class="['task-status-btn', `task-status-btn--${task.status}`]"
              title="클릭하여 상태 순환 (Todo → In Progress → Done)"
              :aria-label="`상태 변경: 현재 ${STATUS_LABEL[task.status]}`"
              @click="handleCycleStatus(task.id)"
            >
              <i
                :class="['task-icon task-icon--sm', STATUS_ICON[task.status]]"
                aria-hidden="true"
              ></i>
              <span>{{ STATUS_LABEL[task.status] }}</span>
            </button>

            <div class="task-card-body">
              <h2 class="task-card-title">{{ task.title }}</h2>
              <p v-if="task.note" class="task-card-note">{{ task.note }}</p>
            </div>

            <button
              type="button"
              class="task-delete-btn"
              :aria-label="`${task.title} 삭제`"
              title="항목 삭제"
              @click="handleDeleteTask(task.id)"
            >
              <i class="task-icon icon-trash-2" aria-hidden="true"></i>
            </button>
          </div>

          <div class="task-card-meta">
            <div class="task-card-badges">
              <span :class="['task-priority-badge', `task-priority-badge--${task.priority}`]">
                {{ PRIORITY_LABEL[task.priority] }}
              </span>
              <span :class="['task-category-badge', `task-category-badge--${task.category}`]">
                <i
                  :class="['task-icon task-icon--sm', CATEGORY_ICON[task.category]]"
                  aria-hidden="true"
                ></i>
                <span>{{ CATEGORY_LABEL[task.category] }}</span>
              </span>
            </div>

            <time class="task-card-time" :datetime="task.updatedAt">
              {{ formatUpdatedAt(task.updatedAt) }}
            </time>
          </div>
        </article>
      </div>
    </main>

    <footer class="task-footer">
      <span class="task-footer-count">
        Showing {{ filteredTasks.length }} of {{ tasks.length }} tasks
      </span>
      <span class="task-footer-sync">
        <span class="task-footer-sync-dot" aria-hidden="true"></span>
        <span>Synced via @ferdy/extern-task</span>
      </span>
    </footer>
  </div>
</template>
