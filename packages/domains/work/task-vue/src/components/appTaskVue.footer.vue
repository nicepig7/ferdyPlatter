<script setup lang="ts">
import './appTaskVue.footer.css';

defineProps<{
  filteredCount: number;
  totalCount: number;
}>();
</script>

<template>
  <footer class="task-footer">
    <span class="task-footer-count">
      Showing {{ filteredCount }} of {{ totalCount }} tasks
    </span>
    <span class="task-footer-sync">
      <span class="task-footer-sync-dot" aria-hidden="true"></span>
      <span>Synced via @ferdy/extern-task</span>
    </span>
  </footer>
</template>
