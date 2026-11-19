<script setup lang="ts">
import {
  CATEGORY_LABEL,
  CATEGORY_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '../common/appTaskVue.constants';
import type { CategoryFilter, StatusFilter, TaskCounts } from '../common/appTaskVue.types';
import './appTaskVue.filterBar.css';

defineProps<{
  counts: TaskCounts;
  isBusy: boolean;
}>();

const statusFilter = defineModel<StatusFilter>('statusFilter', { required: true });
const categoryFilter = defineModel<CategoryFilter>('categoryFilter', { required: true });
const searchQuery = defineModel<string>('searchQuery', { required: true });

const emit = defineEmits<{
  resetSeed: [];
}>();
</script>

<template>
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
          @click="emit('resetSeed')"
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
</template>
