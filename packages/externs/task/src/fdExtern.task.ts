import { createLocalStorageTaskAdapter } from './fdExtern.task.adapter';
import type {
  CreateTaskInput,
  TaskChangeListener,
  TaskExternService,
  TaskItem,
  UpdateTaskPatch,
} from './fdExtern.task.type';

/**
 * 현재 활성화된 외부 스토리지 어댑터.
 * 향후 OPFS 또는 REST API 전환 시 이 바인딩만 교체합니다.
 */
const activeTaskAdapter: TaskExternService = createLocalStorageTaskAdapter();

/**
 * [E] Externs — Task 도메인 대표 공개 서비스 퍼사드
 */
export const taskExternService: TaskExternService = {
  /** 저장된 전체 Task 목록을 조회합니다 (초기 미생성 시 시드 데이터로 자동 초기화). */
  listTasks: (): Promise<TaskItem[]> => activeTaskAdapter.listTasks(),

  /** 새로운 Task 항목을 생성하고 변경 사항을 모든 창에 전파합니다. */
  createTask: (input: CreateTaskInput): Promise<TaskItem> =>
    activeTaskAdapter.createTask(input),

  /** 지정한 ID의 Task 필드를 부분 수정하고 변경 사항을 전파합니다. */
  updateTask: (id: string, patch: UpdateTaskPatch): Promise<TaskItem> =>
    activeTaskAdapter.updateTask(id, patch),

  /** 지정한 Task의 상태를 다음 단계(`todo` → `in-progress` → `done` → `todo`)로 순환합니다. */
  cycleTaskStatus: (id: string): Promise<TaskItem> =>
    activeTaskAdapter.cycleTaskStatus(id),

  /** 지정한 ID의 Task를 삭제하고 변경 사항을 전파합니다. */
  deleteTask: (id: string): Promise<void> => activeTaskAdapter.deleteTask(id),

  /** 전체 Task 목록을 초기 데모 시드 데이터로 초기화하고 전파합니다. */
  resetToSeed: (): Promise<TaskItem[]> => activeTaskAdapter.resetToSeed(),

  /** 현재 창 및 다른 `iframe` 창의 Task 목록 변경 이벤트를 구독하고 해제 함수를 반환합니다. */
  subscribe: (listener: TaskChangeListener): (() => void) =>
    activeTaskAdapter.subscribe(listener),
};
