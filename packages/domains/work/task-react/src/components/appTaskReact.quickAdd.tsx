import { FormEvent, useState } from 'react';
import type { TaskCategory, TaskPriority } from '@ferdy/extern-task';
import {
  CATEGORY_LABEL,
  CATEGORY_OPTIONS,
  PRIORITY_LABEL,
  PRIORITY_OPTIONS,
} from '../common/appTaskReact.constants';
import type { CreateTaskPayload } from '../common/appTaskReact.types';
import './appTaskReact.quickAdd.css';

interface TaskQuickAddProps {
  isBusy: boolean;
  onCreate: (payload: CreateTaskPayload) => Promise<boolean>;
}

export function TaskQuickAdd({ isBusy, onCreate }: TaskQuickAddProps) {
  const [titleInput, setTitleInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<TaskCategory>('work');
  const [priorityInput, setPriorityInput] = useState<TaskPriority>('medium');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = titleInput.trim();
    if (!trimmedTitle || isBusy) return;

    const created = await onCreate({
      title: trimmedTitle,
      note: noteInput.trim() || undefined,
      category: categoryInput,
      priority: priorityInput,
    });

    if (created) {
      setTitleInput('');
      setNoteInput('');
    }
  };

  return (
    <form className="task-quick-add" onSubmit={handleSubmit}>
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
  );
}
