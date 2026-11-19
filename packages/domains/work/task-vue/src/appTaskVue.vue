<script setup lang="ts">
import TaskFilterBar from './components/appTaskVue.filterBar.vue';
import TaskFooter from './components/appTaskVue.footer.vue';
import TaskHeader from './components/appTaskVue.header.vue';
import TaskList from './components/appTaskVue.list.vue';
import TaskQuickAdd from './components/appTaskVue.quickAdd.vue';
import { useTaskBoard } from './composables/appTaskVue.useTaskBoard';
import './appTaskVue.css';

const {
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
} = useTaskBoard();
</script>

<template>
  <div class="task-board">
    <TaskHeader :counts="counts" @compare="compareWithReact" />

    <TaskQuickAdd :is-busy="isBusy" @create="createTask" />

    <TaskFilterBar
      v-model:status-filter="statusFilter"
      v-model:category-filter="categoryFilter"
      v-model:search-query="searchQuery"
      :counts="counts"
      :is-busy="isBusy"
      @reset-seed="resetSeed"
    />

    <TaskList
      :tasks="filteredTasks"
      :is-loading="isLoading"
      @cycle-status="cycleStatus"
      @delete-task="deleteTask"
    />

    <TaskFooter
      :filtered-count="filteredTasks.length"
      :total-count="tasks.length"
    />
  </div>
</template>
