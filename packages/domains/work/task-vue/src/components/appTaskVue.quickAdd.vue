<script setup lang="ts">
import { ref } from 'vue';
import type { TaskCategory, TaskPriority } from '@ferdy/extern-task';
import type {
  FdSelectOption,
  FdTextFieldElement,
  FdTextFieldRule,
} from '@ferdy/ui/elements';
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

const TITLE_RULES: FdTextFieldRule[] = [
  (value) => value.trim().length > 0 || 'Task 제목을 입력하세요.',
];

const CATEGORY_SELECT_OPTIONS: FdSelectOption[] = CATEGORY_OPTIONS.map((category) => ({
  value: category,
  label: CATEGORY_LABEL[category],
}));

const PRIORITY_SELECT_OPTIONS: FdSelectOption[] = PRIORITY_OPTIONS.map((priority) => ({
  value: priority,
  label: PRIORITY_LABEL[priority],
}));

const titleInput = ref('');
const noteInput = ref('');
const categoryInput = ref<TaskCategory>('work');
const priorityInput = ref<TaskPriority>('medium');
const titleFieldRef = ref<FdTextFieldElement | null>(null);

const handleTitleInput = (event: Event) => {
  titleInput.value = (event as CustomEvent<{ value: string }>).detail.value;
};

const handleNoteInput = (event: Event) => {
  noteInput.value = (event as CustomEvent<{ value: string }>).detail.value;
};

const handleCategoryChange = (event: Event) => {
  categoryInput.value = (event as CustomEvent<{ value: string }>).detail.value as TaskCategory;
};

const handlePriorityChange = (event: Event) => {
  priorityInput.value = (event as CustomEvent<{ value: string }>).detail.value as TaskPriority;
};

const handleSubmit = () => {
  const isValid = titleFieldRef.value ? titleFieldRef.value.validate() : true;
  const trimmedTitle = titleInput.value.trim();
  if (!isValid || !trimmedTitle || props.isBusy) return;

  emit('create', {
    title: trimmedTitle,
    note: noteInput.value.trim() || undefined,
    category: categoryInput.value,
    priority: priorityInput.value,
  });

  titleInput.value = '';
  noteInput.value = '';
  titleFieldRef.value?.resetValidation();
};

const handleFieldKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.isComposing) {
    event.preventDefault();
    handleSubmit();
  }
};
</script>

<template>
  <form class="task-quick-add" @submit.prevent="handleSubmit">
    <div class="task-quick-add-inputs">
      <fd-text-field
        ref="titleFieldRef"
        :value="titleInput"
        size="sm"
        clearable
        :maxlength="120"
        placeholder="새 Task 제목 입력 (필수)..."
        aria-label="Task 제목"
        :rules="TITLE_RULES"
        validate-on="lazy"
        @keydown="handleFieldKeyDown"
        @fd-input="handleTitleInput"
        @fd-clear="titleInput = ''"
      />
      <fd-text-field
        :value="noteInput"
        size="sm"
        clearable
        :maxlength="200"
        placeholder="한 줄 메모 (선택)"
        aria-label="Task 메모"
        @keydown="handleFieldKeyDown"
        @fd-input="handleNoteInput"
        @fd-clear="noteInput = ''"
      />
    </div>

    <div class="task-quick-add-controls">
      <div class="task-quick-add-selects">
        <div class="task-field-group">
          <span class="task-field-label">Category</span>
          <fd-select
            class="task-quick-add-select"
            size="sm"
            :options="CATEGORY_SELECT_OPTIONS"
            :value="categoryInput"
            aria-label="분류 선택"
            @fd-change="handleCategoryChange"
          />
        </div>

        <div class="task-field-group">
          <span class="task-field-label">Priority</span>
          <fd-select
            class="task-quick-add-select"
            size="sm"
            :options="PRIORITY_SELECT_OPTIONS"
            :value="priorityInput"
            aria-label="우선순위 선택"
            @fd-change="handlePriorityChange"
          />
        </div>
      </div>

      <button
        type="submit"
        class="fd-btn fd-btn--sm fd-btn--primary"
        :disabled="isBusy"
      >
        <i class="task-icon icon-plus" aria-hidden="true"></i>
        <span>Add Task</span>
      </button>
    </div>
  </form>
</template>
