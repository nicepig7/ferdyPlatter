import type { TaskItem } from '@ferdy/extern-task';
import { TaskCard } from './appTaskReact.card';
import './appTaskReact.list.css';

interface TaskListProps {
  tasks: TaskItem[];
  isLoading: boolean;
  onCycleStatus: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskList({
  tasks,
  isLoading,
  onCycleStatus,
  onDeleteTask,
}: TaskListProps) {
  return (
    <main className="task-list-container">
      {isLoading ? (
        <div className="task-empty">
          <i className="task-icon task-empty-icon icon-list-todo" aria-hidden="true" />
          <p className="task-empty-title">Task 목록을 불러오는 중...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="task-empty">
          <i className="task-icon task-empty-icon icon-list-todo" aria-hidden="true" />
          <p className="task-empty-title">조건에 맞는 Task가 없습니다</p>
          <p className="task-empty-desc">
            새 Task를 추가하거나 필터·검색 조건을 조정해 보세요.
          </p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onCycleStatus={onCycleStatus}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </main>
  );
}
