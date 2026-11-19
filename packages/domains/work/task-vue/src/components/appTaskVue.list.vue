<script setup lang="ts">
import type { TaskItem } from '@ferdy/extern-task';
import TaskCard from './appTaskVue.card.vue';
import './appTaskVue.list.css';

defineProps<{
  tasks: TaskItem[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  cycleStatus: [id: string];
  deleteTask: [id: string];
}>();
</script>

<template>
  <main class="task-list-container">
    <div v-if="isLoading" class="task-empty">
      <i class="task-icon task-empty-icon icon-list-todo" aria-hidden="true"></i>
      <p class="task-empty-title">Task 목록을 불러오는 중...</p>
    </div>

    <div v-else-if="tasks.length === 0" class="task-empty">
      <i class="task-icon task-empty-icon icon-list-todo" aria-hidden="true"></i>
      <p class="task-empty-title">조건에 맞는 Task가 없습니다</p>
      <p class="task-empty-desc">
        새 Task를 추가하거나 필터·검색 조건을 조정해 보세요.
      </p>
    </div>

    <div v-else class="task-list">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @cycle-status="emit('cycleStatus', $event)"
        @delete-task="emit('deleteTask', $event)"
      />
    </div>
  </main>
</template>
