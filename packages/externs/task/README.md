# @ferdy/extern-task (`packages/externs/task`)

**Ferdy Platter (FerdyOS)**의 **[E] Externs** 계층에 속하는 **Task 외부 저장 및 창 간 동기화 어댑터 패키지**입니다.  
도메인 앱(`packages/domains/**`)에는 순수 데이터 모델과 `Promise` 기반 계약(`TaskExternService`)만 공개하고, `localStorage` 영속화 및 `BroadcastChannel` 실시간 동기화 세부 구현은 내부로 캡슐화합니다.

---

## 디렉토리 구조

```text
src/
├── index.ts                   # 공개 진입점 (계약 타입 및 taskExternService 싱글턴만 export)
├── fdExtern.task.ts           # [대표 파일] 공개 서비스 퍼사드 & 활성 어댑터 바인딩
├── fdExtern.task.type.ts      # [계약/모델] TaskItem, TaskExternService 등 순수 타입 정의
├── fdExtern.task.adapter.ts   # [I/O 구현체] localStorage + BroadcastChannel 기반 TaskExternService 구현
├── fdExtern.task.util.ts      # [순수 유틸] 입력 정규화, 상태 전이, 런타임 검증 헬퍼
└── fdExtern.task.seed.ts      # [초기 데이터] 초기 실행 및 resetToSeed()용 시드 데이터
```

---

## 공개 계약 (`TaskExternService`)

### 데이터 모델
- `TaskStatus`: `'todo' | 'in-progress' | 'done'`
- `TaskPriority`: `'low' | 'medium' | 'high'`
- `TaskCategory`: `'work' | 'personal' | 'study' | 'idea'`
- `TaskItem`: `id`, `title`, `note?`, `status`, `priority`, `category`, `createdAt`, `updatedAt`
- `CreateTaskInput` / `UpdateTaskPatch` / `TaskChangeListener`

### 서비스 메서드 (`taskExternService`)
- `listTasks(): Promise<TaskItem[]>`: 저장된 전체 Task 목록 조회 (초기 미생성 상태일 경우 시드 데이터로 자동 초기화)
- `createTask(input: CreateTaskInput): Promise<TaskItem>`: 새 Task 생성 및 전파
- `updateTask(id: string, patch: UpdateTaskPatch): Promise<TaskItem>`: 지정 Task 부분 수정 및 전파
- `cycleTaskStatus(id: string): Promise<TaskItem>`: 상태 순환 (`todo` → `in-progress` → `done` → `todo`)
- `deleteTask(id: string): Promise<void>`: 지정 Task 삭제 및 전파
- `resetToSeed(): Promise<TaskItem[]>`: 초기 데모 시드 데이터로 복원 및 전파
- `subscribe(listener: (tasks: TaskItem[]) => void): () => void`: 로컬 및 타 `iframe` 창 변경 구독 및 해제 함수 반환

---

## 내부 동기화 메커니즘 (캡슐화 영역)

1. **영속화**: 브라우저 `localStorage` 키 `ferdy:extern:tasks`에 JSON 배열로 직렬화하여 저장합니다.
2. **실시간 멀티 `iframe` 동기화**:
   - 데이터 변경 시 `BroadcastChannel('ferdy:extern:task')`로 변경 알림을 발행하여 동일 오리진 내 다른 프레임워크 앱 창(React ↔ Vue 등)에 즉시 반영합니다.
   - `window`의 `storage` 이벤트를 함께 구독하여 다른 탭·문서에서의 변경도 일관되게 수신합니다.

---

## 사용 예시

```ts
import { taskExternService, type TaskItem } from '@ferdy/extern-task';

const initialTasks: TaskItem[] = await taskExternService.listTasks();

const unsubscribe = taskExternService.subscribe((nextTasks) => {
  console.log('Synced tasks:', nextTasks);
});

await taskExternService.createTask({
  title: 'Review PR #42',
  priority: 'high',
  category: 'work',
});

unsubscribe();
```
