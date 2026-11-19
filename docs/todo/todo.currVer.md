# v0.1.8 — Multi-Framework MPA (React & Vue) & `[E] Externs` Layer

> **상위 문서**: [todo.md](./todo.md) | **릴리즈 노트**: [releases.0.1.md](../releases/releases.0.1.md)

---

## 🎯 버전 목표 (Milestone Goals)

1. **Single-Server MPA 기반 멀티 프레임워크 공존**:
   - 단일 Vite 서버(`:3000`)와 프로덕션 멀티페이지 번들링 위에서 **React**와 **Vue** 도메인 앱이 기존 SolidJS 코어(`@ferdy/core`) 및 기존 앱들과 충돌 없이 함께 실행되도록 빌드·타입 파이프라인을 확장합니다. *(Svelte 확장은 향후 과제로 유보)*
2. **`[E] Externs` 레이어 정립 (`packages/externs/*`)**:
   - 기존 `[E] Etc` 예비 공간을 시스템 외부(`localStorage`, `OPFS`, 향후 `REST API` 등)와의 소통을 전담하는 **`packages/externs/*` (External Storage & I/O Adapter Layer)** 로 재정의합니다.
   - 도메인 앱에는 **순수 인터페이스(Contract)와 데이터 모델**만 제공하고, 저장·동기화 세부 구현은 `[E]` 레이어가 캡슐화합니다.
3. **동일 기능 기반 업무·개인 Task 보드 앱 2종 구현 및 실시간 창 간 동기화**:
   - `work` 카테고리를 신설하고 동일한 스펙의 개인 Task & 업무 티켓 보드 앱(`@ferdy/work-task-react`, `@ferdy/work-task-vue`)을 각각 React와 Vue로 구현합니다.
   - 두 창을 나란히 띄워 한쪽에서 Task를 추가/변경하면 다른 프레임워크 앱 창에도 즉시 동기화되는 MPA 시너지를 검증합니다.

---

## 🏗️ 아키텍처 개요

```text
[D] Domains (Iframe Sandboxes)
 ├── @ferdy/work-task-react  (/domains/work/task-react/)
 └── @ferdy/work-task-vue    (/domains/work/task-vue/)
          │
          ▼  (순수 인터페이스 / Promise 기반 계약만 의존)
[E] Externs (@ferdy/extern-task, packages/externs/task/)
 ├── Root Facade     : fdExtern.task.ts (taskExternService 공개 퍼사드 & 어댑터 바인딩)
 ├── Public Contract : fdExtern.task.type.ts (TaskItem, TaskExternService)
 └── Internal Adapter: fdExtern.task.adapter.ts, fdExtern.task.util.ts, fdExtern.task.seed.ts
          │
          ├── v0.1.8 : localStorage 영속화 + BroadcastChannel('ferdy:extern:task') 창 간 동기화
          └── Future : OPFS 파일 시스템 / 원격 REST API 어댑터 교체 (도메인 앱 코드 무변경)
```

---

## ✅ 세부 작업 Task 목록

### Phase 1: `[E] Externs` 레이어 전환 및 `@ferdy/extern-task` 패키지 구축
- [x] **워크스페이스 전환**: 루트 `package.json`의 `"packages/etc/*"`를 `"packages/externs/*"`로 변경
- [x] **패키지 초기화**: `packages/externs/task/` (`@ferdy/extern-task`)에 `package.json`, `tsconfig.json`, `README.md` 생성
- [x] **인터페이스 및 모델 정의 (`src/fdExtern.task.type.ts`)**:
  - `TaskStatus`: `'todo' | 'in-progress' | 'done'`
  - `TaskPriority`: `'low' | 'medium' | 'high'`
  - `TaskCategory`: `'work' | 'personal' | 'study' | 'idea'`
  - `TaskItem`: `id`, `title`, `note?`, `status`, `priority`, `category`, `createdAt`, `updatedAt`
  - `CreateTaskInput`, `UpdateTaskPatch`
  - 비동기(`Promise`) 기반 `TaskExternService` 인터페이스:
    - `listTasks(): Promise<TaskItem[]>`
    - `createTask(input: CreateTaskInput): Promise<TaskItem>`
    - `updateTask(id: string, patch: UpdateTaskPatch): Promise<TaskItem>`
    - `cycleTaskStatus(id: string): Promise<TaskItem>` (`todo` → `in-progress` → `done`)
    - `deleteTask(id: string): Promise<void>`
    - `resetToSeed(): Promise<TaskItem[]>`
    - `subscribe(listener: (tasks: TaskItem[]) => void): () => void`
- [x] **기본 시드 데이터 (`src/fdExtern.task.seed.ts`)**: 업무 티켓과 개인 할 일이 조화된 초기 데모 데이터 정의
- [x] **내부 저장·동기화 어댑터 & 유틸 (`src/fdExtern.task.adapter.ts`, `src/fdExtern.task.util.ts`)**:
  - `localStorage` 기반 JSON 직렬화 영속화 및 런타임 검증·정규화 유틸리티 분리
  - `BroadcastChannel('ferdy:extern:task')` 및 `window` `storage` 이벤트를 활용한 동일 오리진 내 다중 `iframe` 창 간 실시간 변경 전파
- [x] **대표 공개 서비스 퍼사드 (`src/fdExtern.task.ts`)**: 활성 어댑터 바인딩 및 `taskExternService` 공개 퍼사드 구현
- [x] **공개 진입점 (`src/index.ts`)**: 외부 앱에는 인터페이스/타입 및 `taskExternService` 싱글턴 인스턴스만 노출 (내부 구현 세부는 비공개 캡슐화)

### Phase 2: 멀티 프레임워크 빌드·타입 파이프라인 및 `work` 카테고리 확장
- [x] **`@ferdy/tsconfig` 확장 (`packages/base/tsconfig/`)**:
  - React용 `react.json` (`"jsx": "react-jsx"`, `"jsxImportSource": "react"`) 추가
  - Vue용 `vue.json` (`"jsx": "preserve"`) 추가 및 `package.json` `exports` 등록
- [x] **단일 Vite 게이트웨이 멀티 프레임워크 스코핑 (`packages/core/`)**:
  - `@vitejs/plugin-react`, `@vitejs/plugin-vue` devDependencies 추가
  - `packages/core/vite.config.ts`에서 플러그인 스코핑 구성:
    - `vite-plugin-solid`: `exclude`로 React/Vue 도메인 앱 경로 제외
    - `@vitejs/plugin-react`: `include`로 React 도메인 앱(`packages/domains/work/task-react/`) 전담
    - `@vitejs/plugin-vue`: `.vue` 파일 전담 처리
- [x] **`work` 앱 카테고리 추가 (`packages/core/`)**:
  - `src/types/fdCore.app.type.ts`: `AppCategory`에 `'work'` 추가 (`'builtin' | 'sample' | 'work'`)
  - `src/components/taskbar/components/fdShell.taskbar.start.tsx`: 시작 메뉴 카테고리 필터 탭 및 섹션 목록에 `Work` (`Work Apps`) 반영

### Phase 3: React 기반 Task 보드 도메인 앱 (`@ferdy/work-task-react`)
- [x] **패키지 스캐폴딩 (`packages/domains/work/task-react/`)**:
  - `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `README.md` 작성
  - 서빙 경로: `/domains/work/task-react/` (`<head>` FOUC 방지 다크 프리로드 스타일 포함)
- [x] **공통 스타일 및 레이어 연동**:
  - `import '@ferdy/ui/styles.css'`로 디자인 토큰(`--fd-*`), 폰트, 다크 테마 공유
  - `@ferdy/extern-task` (`taskExternService`) 및 `@ferdy/bridge` (`ferdyBridge`) 연동
- [x] **UI 및 기능 구현**:
  - 상단 헤더: `React 19` 프레임워크 배지, 상태별 요약 카운터(`전체` / `할 일` / `진행중` / `완료`), `ferdyBridge.openWindow`로 Vue 앱을 즉시 여는 `[Compare with Vue]` 버튼
  - 빠른 Task 추가 폼: 제목 입력, 분류(`work` / `personal` / `study` / `idea`), 우선순위(`high` / `medium` / `low`) 선택 및 등록
  - 필터 바: 상태 탭(`All` | `Todo` | `In Progress` | `Done`), 분류 필터, 키워드 검색, `[Reset Seed]` 버튼
  - 티켓 카드 리스트: 상태 배지 클릭 시 원클릭 상태 순환(`todo → in-progress → done`), 우선순위/분류 배지, 메모/시각 표시, 삭제 버튼, 외부 창 변경 시 `subscribe`로 자동 갱신

### Phase 4: Vue 기반 Task 보드 도메인 앱 (`@ferdy/work-task-vue`)
- [x] **패키지 스캐폴딩 (`packages/domains/work/task-vue/`)**:
  - `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `README.md` 작성
  - Vue 3 (`<script setup lang="ts">`) 및 `vue-tsc` 타입체크 스크립트 구성
  - 서빙 경로: `/domains/work/task-vue/` (`<head>` FOUC 방지 다크 프리로드 스타일 포함)
- [x] **공통 스타일 및 레이어 연동**:
  - `import '@ferdy/ui/styles.css'`로 디자인 토큰(`--fd-*`) 및 다크 테마 공유
  - `@ferdy/extern-task` (`taskExternService`) 및 `@ferdy/bridge` (`ferdyBridge`) 연동
- [x] **UI 및 기능 구현 (`@ferdy/work-task-react`와 100% 동일 스펙)**:
  - 상단 헤더: `Vue 3` 프레임워크 배지, 상태별 요약 카운터, `ferdyBridge.openWindow`로 React 앱을 즉시 여는 `[Compare with React]` 버튼
  - 빠른 Task 추가 폼, 다중 필터 바(상태/분류/검색/초기화), 티켓 카드 리스트 및 실시간 동기화

### Phase 5: Core 레지스트리 등록, 통합 검증 및 문서 동기화
- [x] **Core 매니페스트 & 바로가기 등록 (`packages/core/`)**:
  - `src/services/app/fdCore.app.manifest.meta.ts`: `WORK_APP_MANIFESTS` (`work-task-react`, `work-task-vue`) 추가 및 `INITIAL_APP_MANIFESTS` 병합
  - `src/services/app/fdCore.app.shortcuts.meta.ts`: 바탕화면 기본 바로가기 아이콘 등록
- [x] **통합 검증**:
  - 루트 `npm install` 후 `npm run typecheck` 전 패키지 통과 확인
  - 루트 `npm run build` 실행 및 `packages/core/dist/domains/work/task-react/`, `task-vue/` 멀티페이지 번들링 결과 확인
  - 개발 서버(`npm run dev`)에서 React 창 ↔ Vue 창 동시 실행 및 실시간 Task 동기화 동작 확인
- [x] **문서 동기화**:
  - `AGENTS.md`, `README.md`, `docs/architecture.md`, `docs/features.md`, `docs/releases/releases.0.1.md`, `docs/releases/releases.md` 최신화
