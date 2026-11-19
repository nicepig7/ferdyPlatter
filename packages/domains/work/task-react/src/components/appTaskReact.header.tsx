import type { TaskCounts } from '../common/appTaskReact.types';
import './appTaskReact.header.css';

interface TaskHeaderProps {
  counts: TaskCounts;
  onCompare: () => void;
}

export function TaskHeader({ counts, onCompare }: TaskHeaderProps) {
  return (
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
            onClick={onCompare}
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
  );
}
