<script setup lang="ts">
import { ref } from 'vue';
import type { TaskCategory, TaskPriority } from '@ferdy/extern-task';
import {
  CATEGORY_LABEL,
  CATEGORY_OPTIONS,
  PRIORITY_LABEL,
  PRIORITY_OPTIONS,
} from '../common/appTaskVue.constants';
import type { CreateTaskPayload } from '../common/appTaskVue.types';
import './appTaskVue.quickAdd.css';

const props = defineProps<{
  isBusy: boolean;
}>();

const emit = defineEmits<{
  create: [payload: CreateTaskPayload];
}>();

const titleInput = ref('');
const noteInput = ref('');
const categoryInput = ref<TaskCategory>('work');
const priorityInput = ref<TaskPriority>('medium');

const handleSubmit = () => {
  const trimmedTitle = titleInput.value.trim();
  if (!trimmedTitle || props.isBusy) return;

  emit('create', {
    title: trimmedTitle,
    note: noteInput.value.trim() || undefined,
    category: categoryInput.value,
    priority: priorityInput.value,
  });

  titleInput.value = '';
  noteInput.value = '';
};
</script>

<template>
  <form class="task-quick-add" @submit.prevent="handleSubmit">
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
</template>
