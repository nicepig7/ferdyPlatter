import { TaskFilterBar } from './components/appTaskReact.filterBar';
import { TaskFooter } from './components/appTaskReact.footer';
import { TaskHeader } from './components/appTaskReact.header';
import { TaskList } from './components/appTaskReact.list';
import { TaskQuickAdd } from './components/appTaskReact.quickAdd';
import { useTaskBoard } from './hooks/appTaskReact.useTaskBoard';
import './appTaskReact.css';

export function AppTaskReact() {
  const {
    tasks,
    isLoading,
    isBusy,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    counts,
    filteredTasks,
    compareWithVue,
    createTask,
    cycleStatus,
    deleteTask,
    resetSeed,
  } = useTaskBoard();

  return (
    <div className="task-board">
      <TaskHeader counts={counts} onCompare={compareWithVue} />

      <TaskQuickAdd isBusy={isBusy} onCreate={createTask} />

      <TaskFilterBar
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        searchQuery={searchQuery}
        counts={counts}
        isBusy={isBusy}
        onStatusFilterChange={setStatusFilter}
        onCategoryFilterChange={setCategoryFilter}
        onSearchQueryChange={setSearchQuery}
        onResetSeed={resetSeed}
      />

      <TaskList
        tasks={filteredTasks}
        isLoading={isLoading}
        onCycleStatus={cycleStatus}
        onDeleteTask={deleteTask}
      />

      <TaskFooter
        filteredCount={filteredTasks.length}
        totalCount={tasks.length}
      />
    </div>
  );
}
