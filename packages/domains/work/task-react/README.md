# @ferdy/work-task-react (`packages/domains/work/task-react`)

**Ferdy Platter (FerdyOS)**의 **[D] Domains (Work)** 계층에서 동작하는 **React 19** 기반 업무·개인 Task 보드 도메인 앱입니다.

---

## 주요 기능

1. **멀티 프레임워크 MPA 실증 (`React 19` + SolidJS Core)**:
   - SolidJS로 구축된 OS 셸(`@ferdy/core`) 및 기존 앱들과 동일한 Vite 단일 서버(`/domains/work/task-react/`)에서 충돌 없이 실행됩니다.
   - 상단 **`React 19`** 배지로 현재 프레임워크를 식별할 수 있으며, **`[Compare with Vue]`** 버튼으로 `@ferdy/work-task-vue` 창을 나란히 열어 실시간 동기화를 비교할 수 있습니다.
2. **빠른 Task 추가 폼 (Quick Add Form)**:
   - 제목(`title`, 필수)과 한 줄 메모(`note`, 선택), 분류(`work` / `personal` / `study` / `idea`), 우선순위(`high` / `medium` / `low`)를 선택해 새 티켓을 즉시 생성합니다.
3. **다중 필터 및 실시간 검색**:
   - 상태 필터 탭(`All` | `Todo` | `In Progress` | `Done`) 및 분류 필터(`All` | `Work` | `Personal` | `Study` | `Idea`) 지원
   - 키워드 검색(`title` / `note` 실시간 매칭) 및 검색어 초기화 버튼 제공
   - **`[Reset Seed]`** 버튼으로 초기 데모 시드 데이터를 즉시 복원할 수 있습니다.
4. **원클릭 상태 순환 및 다중 창 실시간 동기화**:
   - 각 티켓 카드의 상태 배지를 클릭하면 `todo` → `in-progress` → `done` → `todo` 순서로 상태가 순환됩니다.
   - 다른 창(다중 React 창 또는 Vue 창)에서 발생한 생성/상태 변경/삭제/시드 복원 내역이 `taskExternService.subscribe(...)`를 통해 즉시 반영됩니다.

---

## 디렉토리 구조

```text
packages/domains/work/task-react/
├── index.html          # 앱 엔트리 HTML (/domains/work/task-react/ 로 서빙, FOUC 방지 프리로드 포함)
├── package.json        # @ferdy/work-task-react 패키지 정의 (React 19)
├── tsconfig.json       # @ferdy/tsconfig/react.json 확장 TypeScript 설정
├── tsconfig.node.json  # @ferdy/tsconfig/node.json 확장 Vite 설정용 TypeScript 설정
├── vite.config.ts      # 개별 앱 단독 실행/빌드용 @vitejs/plugin-react 설정
├── README.md           # 앱 개요 및 연동 명세
└── src/
    ├── main.tsx        # @ferdy/ui/styles.css 로드 및 React 19 createRoot 마운트
    ├── appTaskReact.tsx # Task 보드 메인 컴포넌트 (@ferdy/extern-task, @ferdy/bridge 연동)
    └── appTaskReact.css # --fd-* 디자인 토큰 기반 다크 테마 스타일 (Vue 앱과 동일 클래스 구조)
```

---

## 패키지 연동 명세

### 1. `@ferdy/ui` 스타일 공유 (프레임워크 격리)
- `@ferdy/ui`의 JS 컴포넌트(`fd.*`)는 SolidJS 전용이므로 import하지 않고, `src/main.tsx`에서 **`import '@ferdy/ui/styles.css'`** 만 로드합니다.
- `--fd-*` 디자인 토큰, `Pretendard Variable` / `D2Coding` 웹폰트, `lucide-static` 아이콘 클래스(`.icon-*`), 다크 에스프레소 테마를 그대로 공유합니다.

### 2. `[E] Externs` (`@ferdy/extern-task`)
- 직접 `localStorage`나 `BroadcastChannel`을 호출하지 않고, 공개 퍼사드인 `taskExternService` 계약만 사용합니다:
  - `listTasks()`: 초기 Task 목록 조회
  - `createTask(input)`: 새 Task 생성
  - `cycleTaskStatus(id)`: 상태 순환 (`todo` → `in-progress` → `done` → `todo`)
  - `deleteTask(id)`: Task 삭제
  - `resetToSeed()`: 초기 시드 데이터로 복원
  - `subscribe(listener)`: 타 창 변경 사항 실시간 구독 및 언마운트 시 해제

### 3. `@ferdy/bridge` (`ferdyBridge`)
- `[Compare with Vue]` 버튼 클릭 시 부모 Core에 Vue 비교 창 실행을 요청합니다:
  ```ts
  ferdyBridge.openWindow({
    appId: 'work-task-vue',
    title: 'Task Board (Vue)',
    appUrl: '/domains/work/task-vue/',
  });
  ```

---

## 실행 및 검증

### 1. FerdyOS Core 내부에서 실행
모노레포 루트에서 `npm run dev` 실행 후 `/domains/work/task-react/` 경로로 서빙됩니다.

### 2. 패키지 단독 타입 체크
```bash
npm run typecheck --workspace=@ferdy/work-task-react
```
