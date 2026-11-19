<script setup lang="ts">
import { computed } from 'vue';
import type { FdTabItem } from '@ferdy/ui/elements';
import {
  CATEGORY_LABEL,
  CATEGORY_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '../common/appTaskVue.constants';
import type { CategoryFilter, StatusFilter, TaskCounts } from '../common/appTaskVue.types';
import './appTaskVue.filterBar.css';

const props = defineProps<{
  counts: TaskCounts;
  isBusy: boolean;
}>();

const statusFilter = defineModel<StatusFilter>('statusFilter', { required: true });
const categoryFilter = defineModel<CategoryFilter>('categoryFilter', { required: true });
const searchQuery = defineModel<string>('searchQuery', { required: true });

const emit = defineEmits<{
  resetSeed: [];
}>();

const statusTabItems = computed<FdTabItem[]>(() =>
  STATUS_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    count: props.counts[option.value],
  }))
);

const handleStatusTabChange = (event: Event) => {
  statusFilter.value = (event as CustomEvent<{ value: string }>).detail.value as StatusFilter;
};

const handleSearchInput = (event: Event) => {
  searchQuery.value = (event as CustomEvent<{ value: string }>).detail.value;
};
</script>

<template>
  <section class="task-filter-bar" aria-label="필터 및 검색">
    <div class="task-filter-row">
      <fd-tabs
        :items="statusTabItems"
        :value="statusFilter"
        variant="pill"
        size="sm"
        aria-label="상태 필터"
        @fd-change="handleStatusTabChange"
      />

      <div class="task-filter-right">
        <fd-text-field
          class="task-search-field"
          size="sm"
          left-icon="search"
          clearable
          placeholder="제목 / 메모 검색..."
          :value="searchQuery"
          aria-label="키워드 검색"
          @fd-input="handleSearchInput"
          @fd-clear="searchQuery = ''"
        />

        <button
          type="button"
          class="fd-btn fd-btn--sm fd-btn--neutral"
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
