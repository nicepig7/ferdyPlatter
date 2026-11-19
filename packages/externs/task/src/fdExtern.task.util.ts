import type {
  CreateTaskInput,
  TaskCategory,
  TaskItem,
  TaskPriority,
  TaskStatus,
  UpdateTaskPatch,
} from './fdExtern.task.type';

const NEXT_STATUS_MAP: Record<TaskStatus, TaskStatus> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
};

const VALID_STATUSES = new Set<TaskStatus>(['todo', 'in-progress', 'done']);
const VALID_PRIORITIES = new Set<TaskPriority>(['low', 'medium', 'high']);
const VALID_CATEGORIES = new Set<TaskCategory>([
  'work',
  'personal',
  'study',
  'idea',
]);

/**
 * Task 수명 주기상 다음 상태(`todo` → `in-progress` → `done` → `todo`)를 반환합니다.
 */
export function getNextTaskStatus(status: TaskStatus): TaskStatus {
  return NEXT_STATUS_MAP[status];
}

/**
 * 고유한 Task 또는 어댑터 인스턴스 식별자를 생성합니다.
 */
export function generateTaskId(prefix = 'task'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Task 제목의 앞뒤 공백을 제거하고 빈 값이면 예외를 발생시킵니다.
 */
export function normalizeTitle(rawTitle: string): string {
  const trimmed = rawTitle.trim();
  if (!trimmed) {
    throw new Error('Task title must not be empty.');
  }
  return trimmed;
}

/**
 * 선택적 메모 문자열을 정리하며, 공백뿐인 경우 `undefined`를 반환합니다.
 */
export function normalizeNote(note: string | undefined): string | undefined {
  if (note === undefined) return undefined;
  const trimmed = note.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * 호출 측의 객체 변이가 내부 스냅샷에 영향을 주지 않도록 항목별 얕은 복제 배열을 생성합니다.
 */
export function cloneTasks(tasks: readonly TaskItem[]): TaskItem[] {
  return tasks.map((task) => ({ ...task }));
}

/**
 * 저장소에서 읽은 값이 유효한 `TaskItem` 스키마인지 런타임에 검증합니다.
 */
export function isValidTaskItem(value: unknown): value is TaskItem {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    (candidate.note === undefined || typeof candidate.note === 'string') &&
    VALID_STATUSES.has(candidate.status as TaskStatus) &&
    VALID_PRIORITIES.has(candidate.priority as TaskPriority) &&
    VALID_CATEGORIES.has(candidate.category as TaskCategory) &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  );
}

/**
 * 생성 입력값(`CreateTaskInput`)을 정규화하여 새 `TaskItem` 엔티티를 조립합니다.
 */
export function buildNewTaskItem(input: CreateTaskInput): TaskItem {
  const title = normalizeTitle(input.title);
  const note = normalizeNote(input.note);
  const now = new Date().toISOString();

  return {
    id: generateTaskId('task'),
    title,
    ...(note !== undefined ? { note } : {}),
    status: input.status ?? 'todo',
    priority: input.priority ?? 'medium',
    category: input.category ?? 'work',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 기존 `TaskItem`에 부분 수정 패치(`UpdateTaskPatch`)를 적용한 새 스냅샷을 반환합니다.
 */
export function applyTaskPatch(
  existing: TaskItem,
  patch: UpdateTaskPatch
): TaskItem {
  const nextTitle =
    patch.title !== undefined ? normalizeTitle(patch.title) : existing.title;
  const nextNote =
    patch.note !== undefined ? normalizeNote(patch.note) : existing.note;

  const updated: TaskItem = {
    ...existing,
    title: nextTitle,
    status: patch.status ?? existing.status,
    priority: patch.priority ?? existing.priority,
    category: patch.category ?? existing.category,
    updatedAt: new Date().toISOString(),
  };

  if (nextNote !== undefined) {
    updated.note = nextNote;
  } else {
    delete updated.note;
  }

  return updated;
}
