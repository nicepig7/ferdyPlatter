<script setup lang="ts">
import type { TaskCounts } from '../common/appTaskVue.types';
import './appTaskVue.header.css';

defineProps<{
  counts: TaskCounts;
}>();

const emit = defineEmits<{
  compare: [];
}>();
</script>

<template>
  <header class="task-header">
    <div class="task-header-main">
      <div class="task-brand">
        <span class="task-brand-icon" aria-hidden="true">
          <i class="task-icon task-icon--lg icon-kanban"></i>
        </span>
        <h1 class="task-brand-title">Task Board</h1>
        <span class="fd-badge task-fw-badge--vue">Vue 3</span>
      </div>

      <div class="task-header-actions">
        <button
          type="button"
          class="fd-btn fd-btn--sm fd-btn--secondary-ghost"
          title="React 19 Task Board 창을 열어 실시간 동기화 비교"
          @click="emit('compare')"
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
</template>
