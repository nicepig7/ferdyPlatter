import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ferdyBridge } from '@ferdy/bridge';
import {
  taskExternService,
  type TaskCategory,
  type TaskItem,
  type TaskPriority,
  type TaskStatus,
} from '@ferdy/extern-task';
import './appTaskReact.css';

type StatusFilter = 'all' | TaskStatus;
type CategoryFilter = 'all' | TaskCategory;

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'Todo',
  'in-progress': 'In Progress',
  done: 'Done',
};

const STATUS_ICON: Record<TaskStatus, string> = {
  todo: 'icon-circle',
  'in-progress': 'icon-clock',
  done: 'icon-check-circle-2',
};

const CATEGORY_LABEL: Record<TaskCategory, string> = {
  work: 'Work',
  personal: 'Personal',
  study: 'Study',
  idea: 'Idea',
};

const CATEGORY_ICON: Record<TaskCategory, string> = {
  work: 'icon-briefcase',
  personal: 'icon-user',
  study: 'icon-book-open',
  idea: 'icon-lightbulb',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const STATUS_FILTER_OPTIONS: readonly { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const CATEGORY_OPTIONS: readonly TaskCategory[] = [
  'work',
  'personal',
  'study',
  'idea',
];

const PRIORITY_OPTIONS: readonly TaskPriority[] = ['high', 'medium', 'low'];

function formatUpdatedAt(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function AppTaskReact() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  // Quick Add Form state
  const [titleInput, setTitleInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<TaskCategory>('work');
  const [priorityInput, setPriorityInput] = useState<TaskPriority>('medium');

  // Filter & Search state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    taskExternService
      .listTasks()
      .then((initialTasks) => {
        if (!isMounted) return;
        setTasks(initialTasks);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    const unsubscribe = taskExternService.subscribe((nextTasks) => {
      if (!isMounted) return;
      setTasks(nextTasks);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const counts = useMemo(() => {
    let todo = 0;
    let inProgress = 0;
    let done = 0;

    for (const task of tasks) {
      if (task.status === 'todo') todo += 1;
      else if (task.status === 'in-progress') inProgress += 1;
      else if (task.status === 'done') done += 1;
    }

    return {
      all: tasks.length,
      todo,
      'in-progress': inProgress,
      done,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== 'all' && task.category !== categoryFilter) {
        return false;
      }
      if (normalizedQuery) {
        const titleMatch = task.title.toLowerCase().includes(normalizedQuery);
        const noteMatch = (task.note ?? '').toLowerCase().includes(normalizedQuery);
        if (!titleMatch && !noteMatch) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, statusFilter, categoryFilter, searchQuery]);

  const handleCompareWithVue = () => {
    ferdyBridge.openWindow({
      appId: 'work-task-vue',
      title: 'Task Board (Vue)',
      appUrl: '/domains/work/task-vue/',
    });
  };

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = titleInput.trim();
    if (!trimmedTitle || isBusy) return;

    setIsBusy(true);
    try {
      await taskExternService.createTask({
        title: trimmedTitle,
        note: noteInput.trim() || undefined,
        category: categoryInput,
        priority: priorityInput,
      });
      setTitleInput('');
      setNoteInput('');
    } finally {
      setIsBusy(false);
    }
  };

  const handleCycleStatus = async (id: string) => {
    await taskExternService.cycleTaskStatus(id);
  };

  const handleDeleteTask = async (id: string) => {
    await taskExternService.deleteTask(id);
  };

  const handleResetSeed = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await taskExternService.resetToSeed();
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="task-board">
      <header className="task-header">
        <div className="task-header-main">
          <div className="task-brand">
            <span className="task-brand-icon" aria-hidden="true">
              <i className="task-icon task-icon--lg icon-kanban" />
            </span>
            <h1 className="task-brand-title">Task Board</h1>
            <span className="task-fw-badge task-fw-badge--react">React 19</span>
          </div>

          <div className="task-header-actions">
            <button
              type="button"
              className="task-compare-btn"
              onClick={handleCompareWithVue}
              title="Vue 3 Task Board 창을 열어 실시간 동기화 비교"
            >
              <i className="task-icon icon-columns-2" aria-hidden="true" />
              <span>Compare with Vue</span>
            </button>
          </div>
        </div>

        <div className="task-summary-bar" aria-label="Task 요약 카운터">
          <span className="task-stat-pill">
            <span>Total</span>
            <strong>{counts.all}</strong>
          </span>
          <span className="task-stat-pill task-stat-pill--todo">
            <span>Todo</span>
            <strong>{counts.todo}</strong>
          </span>
          <span className="task-stat-pill task-stat-pill--progress">
            <span>In Progress</span>
            <strong>{counts['in-progress']}</strong>
          </span>
          <span className="task-stat-pill task-stat-pill--done">
            <span>Done</span>
            <strong>{counts.done}</strong>
          </span>
        </div>
      </header>

      <form className="task-quick-add" onSubmit={handleCreateTask}>
        <div className="task-quick-add-inputs">
          <input
            type="text"
            className="task-input"
            placeholder="새 Task 제목 입력 (필수)..."
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            aria-label="Task 제목"
            maxLength={120}
          />
          <input
            type="text"
            className="task-input"
            placeholder="한 줄 메모 (선택)"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            aria-label="Task 메모"
            maxLength={200}
          />
        </div>

        <div className="task-quick-add-controls">
          <div className="task-quick-add-selects">
            <label className="task-field-group">
              <span className="task-field-label">Category</span>
              <select
                className="task-select"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value as TaskCategory)}
                aria-label="분류 선택"
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABEL[category]}
                  </option>
                ))}
              </select>
            </label>

            <label className="task-field-group">
              <span className="task-field-label">Priority</span>
              <select
                className="task-select"
                value={priorityInput}
                onChange={(e) => setPriorityInput(e.target.value as TaskPriority)}
                aria-label="우선순위 선택"
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABEL[priority]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="task-add-btn"
            disabled={!titleInput.trim() || isBusy}
          >
            <i className="task-icon icon-plus" aria-hidden="true" />
            <span>Add Task</span>
          </button>
        </div>
      </form>

      <section className="task-filter-bar" aria-label="필터 및 검색">
        <div className="task-filter-row">
          <div className="task-tabs" role="tablist" aria-label="상태 필터">
            {STATUS_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={statusFilter === option.value}
                className={`task-tab${statusFilter === option.value ? ' is-active' : ''}`}
                onClick={() => setStatusFilter(option.value)}
              >
                <span>{option.label}</span>
                <span className="task-tab-count">{counts[option.value]}</span>
              </button>
            ))}
          </div>

          <div className="task-filter-right">
            <div className="task-search-box">
              <i
                className="task-icon task-icon--sm task-search-icon icon-search"
                aria-hidden="true"
              />
              <input
                type="text"
                className="task-search-input"
                placeholder="제목 / 메모 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="키워드 검색"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="task-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="검색어 지우기"
                  title="검색어 지우기"
                >
                  <i className="task-icon task-icon--sm icon-x" aria-hidden="true" />
                </button>
              )}
            </div>

            <button
              type="button"
              className="task-reset-btn"
              onClick={handleResetSeed}
              disabled={isBusy}
              title="초기 시드 데이터로 복원"
            >
              <i className="task-icon task-icon--sm icon-rotate-ccw" aria-hidden="true" />
              <span>Reset Seed</span>
            </button>
          </div>
        </div>

        <div className="task-category-pills" role="group" aria-label="분류 필터">
          <button
            type="button"
            className={`task-category-pill${categoryFilter === 'all' ? ' is-active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            All
          </button>
          {CATEGORY_OPTIONS.map((category) => (
            <button
              key={category}
              type="button"
              className={`task-category-pill${categoryFilter === category ? ' is-active' : ''}`}
              onClick={() => setCategoryFilter(category)}
            >
              {CATEGORY_LABEL[category]}
            </button>
          ))}
        </div>
      </section>

      <main className="task-list-container">
        {isLoading ? (
          <div className="task-empty">
            <i className="task-icon task-empty-icon icon-list-todo" aria-hidden="true" />
            <p className="task-empty-title">Task 목록을 불러오는 중...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="task-empty">
            <i className="task-icon task-empty-icon icon-list-todo" aria-hidden="true" />
            <p className="task-empty-title">조건에 맞는 Task가 없습니다</p>
            <p className="task-empty-desc">
              새 Task를 추가하거나 필터·검색 조건을 조정해 보세요.
            </p>
          </div>
        ) : (
          <div className="task-list">
            {filteredTasks.map((task) => (
              <article
                key={task.id}
                className={`task-card${task.status === 'done' ? ' is-done' : ''}`}
              >
                <div className="task-card-main">
                  <button
                    type="button"
                    className={`task-status-btn task-status-btn--${task.status}`}
                    onClick={() => handleCycleStatus(task.id)}
                    title="클릭하여 상태 순환 (Todo → In Progress → Done)"
                    aria-label={`상태 변경: 현재 ${STATUS_LABEL[task.status]}`}
                  >
                    <i
                      className={`task-icon task-icon--sm ${STATUS_ICON[task.status]}`}
                      aria-hidden="true"
                    />
                    <span>{STATUS_LABEL[task.status]}</span>
                  </button>

                  <div className="task-card-body">
                    <h2 className="task-card-title">{task.title}</h2>
                    {task.note && <p className="task-card-note">{task.note}</p>}
                  </div>

                  <button
                    type="button"
                    className="task-delete-btn"
                    onClick={() => handleDeleteTask(task.id)}
                    aria-label={`${task.title} 삭제`}
                    title="항목 삭제"
                  >
                    <i className="task-icon icon-trash-2" aria-hidden="true" />
                  </button>
                </div>

                <div className="task-card-meta">
                  <div className="task-card-badges">
                    <span className={`task-priority-badge task-priority-badge--${task.priority}`}>
                      {PRIORITY_LABEL[task.priority]}
                    </span>
                    <span className={`task-category-badge task-category-badge--${task.category}`}>
                      <i
                        className={`task-icon task-icon--sm ${CATEGORY_ICON[task.category]}`}
                        aria-hidden="true"
                      />
                      <span>{CATEGORY_LABEL[task.category]}</span>
                    </span>
                  </div>

                  <time className="task-card-time" dateTime={task.updatedAt}>
                    {formatUpdatedAt(task.updatedAt)}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="task-footer">
        <span className="task-footer-count">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </span>
        <span className="task-footer-sync">
          <span className="task-footer-sync-dot" aria-hidden="true" />
          <span>Synced via @ferdy/extern-task</span>
        </span>
      </footer>
    </div>
  );
}
