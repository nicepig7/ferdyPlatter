<script setup lang="ts">
import type { TaskItem } from '@ferdy/extern-task';
import {
  CATEGORY_ICON,
  CATEGORY_LABEL,
  PRIORITY_LABEL,
  STATUS_ICON,
  STATUS_LABEL,
} from '../common/appTaskVue.constants';
import { formatUpdatedAt } from '../common/appTaskVue.utils';
import './appTaskVue.card.css';

defineProps<{
  task: TaskItem;
}>();

const emit = defineEmits<{
  cycleStatus: [id: string];
  deleteTask: [id: string];
}>();
</script>

<template>
  <article :class="['fd-card task-card', { 'is-done': task.status === 'done' }]">
    <div class="task-card-main">
      <button
        type="button"
        :class="['task-status-btn', `task-status-btn--${task.status}`]"
        title="클릭하여 상태 순환 (Todo → In Progress → Done)"
        :aria-label="`상태 변경: 현재 ${STATUS_LABEL[task.status]}`"
        @click="emit('cycleStatus', task.id)"
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
        @click="emit('deleteTask', task.id)"
      >
        <i class="task-icon icon-trash-2" aria-hidden="true"></i>
      </button>
    </div>

    <div class="task-card-meta">
      <div class="task-card-badges">
        <span :class="['fd-badge task-priority-badge', `task-priority-badge--${task.priority}`]">
          {{ PRIORITY_LABEL[task.priority] }}
        </span>
        <span :class="['fd-badge task-category-badge', `task-category-badge--${task.category}`]">
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
</template>
