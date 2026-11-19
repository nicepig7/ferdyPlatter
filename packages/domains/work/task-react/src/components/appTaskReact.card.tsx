import type { TaskItem } from '@ferdy/extern-task';
import {
  CATEGORY_ICON,
  CATEGORY_LABEL,
  PRIORITY_LABEL,
  STATUS_ICON,
  STATUS_LABEL,
} from '../common/appTaskReact.constants';
import { formatUpdatedAt } from '../common/appTaskReact.utils';
import './appTaskReact.card.css';

interface TaskCardProps {
  task: TaskItem;
  onCycleStatus: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskCard({ task, onCycleStatus, onDeleteTask }: TaskCardProps) {
  return (
    <article className={`fd-card task-card${task.status === 'done' ? ' is-done' : ''}`}>
      <div className="task-card-main">
        <button
          type="button"
          className={`task-status-btn task-status-btn--${task.status}`}
          onClick={() => onCycleStatus(task.id)}
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
          onClick={() => onDeleteTask(task.id)}
          aria-label={`${task.title} 삭제`}
          title="항목 삭제"
        >
          <i className="task-icon icon-trash-2" aria-hidden="true" />
        </button>
      </div>

      <div className="task-card-meta">
        <div className="task-card-badges">
          <span className={`fd-badge task-priority-badge task-priority-badge--${task.priority}`}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          <span className={`fd-badge task-category-badge task-category-badge--${task.category}`}>
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
  );
}
