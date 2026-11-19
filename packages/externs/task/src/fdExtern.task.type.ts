/**
 * Task 보드 도메인의 진행 상태
 */
export type TaskStatus = 'todo' | 'in-progress' | 'done';

/**
 * Task 항목의 상대적 우선순위
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * 업무 및 개인 Task의 논리적 분류
 */
export type TaskCategory = 'work' | 'personal' | 'study' | 'idea';

/**
 * 도메인 앱과 Extern 어댑터 간에 공유되는 표준 Task 엔티티
 */
export interface TaskItem {
  id: string;
  title: string;
  note?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  createdAt: string;
  updatedAt: string;
}

/**
 * 새 Task 생성 시 전달하는 입력 페이로드
 */
export interface CreateTaskInput {
  title: string;
  note?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
}

/**
 * 기존 Task 부분 수정 시 전달하는 패치 페이로드
 */
export interface UpdateTaskPatch {
  title?: string;
  note?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
}

/**
 * 영속화된 Task 목록이 변경될 때 호출되는 구독 콜백
 */
export type TaskChangeListener = (tasks: TaskItem[]) => void;

/**
 * [E] Externs Task 서비스가 외부에 노출하는 순수 비동기 계약
 */
export interface TaskExternService {
  /** 저장된 전체 Task 목록을 조회합니다 (초기 미생성 시 시드 데이터로 자동 초기화). */
  listTasks(): Promise<TaskItem[]>;
  /** 새로운 Task 항목을 생성하고 변경 사항을 모든 창에 전파합니다. */
  createTask(input: CreateTaskInput): Promise<TaskItem>;
  /** 지정한 ID의 Task 필드를 부분 수정하고 변경 사항을 전파합니다. */
  updateTask(id: string, patch: UpdateTaskPatch): Promise<TaskItem>;
  /** 지정한 Task의 상태를 다음 단계(`todo` → `in-progress` → `done` → `todo`)로 순환합니다. */
  cycleTaskStatus(id: string): Promise<TaskItem>;
  /** 지정한 ID의 Task를 삭제하고 변경 사항을 전파합니다. */
  deleteTask(id: string): Promise<void>;
  /** 전체 Task 목록을 초기 데모 시드 데이터로 초기화하고 전파합니다. */
  resetToSeed(): Promise<TaskItem[]>;
  /** 현재 창 및 다른 `iframe` 창의 Task 목록 변경 이벤트를 구독하고 해제 함수를 반환합니다. */
  subscribe(listener: TaskChangeListener): () => void;
}
