import { FormEvent, KeyboardEvent, useRef, useState } from 'react';
import type { TaskCategory, TaskPriority } from '@ferdy/extern-task';
import type {
  FdSelectOption,
  FdTextFieldElement,
  FdTextFieldRule,
} from '@ferdy/ui/elements';
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

const TITLE_RULES: FdTextFieldRule[] = [
  (value) => value.trim().length > 0 || 'Task 제목을 입력하세요.',
];

const CATEGORY_SELECT_OPTIONS: FdSelectOption[] = CATEGORY_OPTIONS.map((category) => ({
  value: category,
  label: CATEGORY_LABEL[category],
}));

const PRIORITY_SELECT_OPTIONS: FdSelectOption[] = PRIORITY_OPTIONS.map((priority) => ({
  value: priority,
  label: PRIORITY_LABEL[priority],
}));

export function TaskQuickAdd({ isBusy, onCreate }: TaskQuickAddProps) {
  const [titleInput, setTitleInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<TaskCategory>('work');
  const [priorityInput, setPriorityInput] = useState<TaskPriority>('medium');
  const titleFieldRef = useRef<FdTextFieldElement | null>(null);

  const submitTask = async () => {
    const isValid = titleFieldRef.current ? titleFieldRef.current.validate() : true;
    const trimmedTitle = titleInput.trim();
    if (!isValid || !trimmedTitle || isBusy) return;

    const created = await onCreate({
      title: trimmedTitle,
      note: noteInput.trim() || undefined,
      category: categoryInput,
      priority: priorityInput,
    });

    if (created) {
      setTitleInput('');
      setNoteInput('');
      titleFieldRef.current?.resetValidation();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitTask();
  };

  const handleFieldKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submitTask();
    }
  };

  return (
    <form className="task-quick-add" onSubmit={handleSubmit}>
      <div className="task-quick-add-inputs">
        <fd-text-field
          ref={titleFieldRef}
          value={titleInput}
          size="sm"
          clearable
          maxlength={120}
          placeholder="새 Task 제목 입력 (필수)..."
          aria-label="Task 제목"
          rules={TITLE_RULES}
          validate-on="lazy"
          onKeyDown={handleFieldKeyDown}
          onfd-input={(e) => setTitleInput(e.detail.value)}
          onfd-clear={() => setTitleInput('')}
        />
        <fd-text-field
          value={noteInput}
          size="sm"
          clearable
          maxlength={200}
          placeholder="한 줄 메모 (선택)"
          aria-label="Task 메모"
          onKeyDown={handleFieldKeyDown}
          onfd-input={(e) => setNoteInput(e.detail.value)}
          onfd-clear={() => setNoteInput('')}
        />
      </div>

      <div className="task-quick-add-controls">
        <div className="task-quick-add-selects">
          <div className="task-field-group">
            <span className="task-field-label">Category</span>
            <fd-select
              className="task-quick-add-select"
              size="sm"
              options={CATEGORY_SELECT_OPTIONS}
              value={categoryInput}
              aria-label="분류 선택"
              onfd-change={(e) => setCategoryInput(e.detail.value as TaskCategory)}
            />
          </div>

          <div className="task-field-group">
            <span className="task-field-label">Priority</span>
            <fd-select
              className="task-quick-add-select"
              size="sm"
              options={PRIORITY_SELECT_OPTIONS}
              value={priorityInput}
              aria-label="우선순위 선택"
              onfd-change={(e) => setPriorityInput(e.detail.value as TaskPriority)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="fd-btn fd-btn--sm fd-btn--primary"
          disabled={isBusy}
        >
          <i className="task-icon icon-plus" aria-hidden="true" />
          <span>Add Task</span>
        </button>
      </div>
    </form>
  );
}
