# Features & Roadmap

**Ferdy Platter (FerdyOS)**의 현재 구현된 기능 명세와 향후 발전 방향(Roadmap)을 관리하는 문서입니다.

> **문서 역할 안내**
> - 모노레포 계층, MPA 게이트웨이, UI/Bridge 아키텍처 상세: [architecture.md](./architecture.md)
> - 버전별 변경 이력: [releases.md](./releases/releases.md)
> - 단기 작업 목록 및 상세 아이디어 백로그: [todo.md](./todo/todo.md)

---

## 1. OS Shell (`@ferdy/core`)

### 앱 레지스트리 및 바로가기
- **메타데이터 분리 관리 (`.meta.ts`)**: 설치된 앱 매니페스트(`manifest` — `BUILTIN_APP_MANIFESTS` / `SAMPLE_APP_MANIFESTS` / `WORK_APP_MANIFESTS` 카테고리 구분), 바탕화면 바로가기(`shortcuts`), 아이콘 컬러 톤 프리셋(`tones`)을 개별 파일로 분리해 중앙 관리
- **앱 실행 및 인스턴스 오버라이드**: `appId` 참조 기반 실행과 바로가기별 제목, 아이콘, 컬러 톤, 쿼리 파라미터(`queryParams`), 창 좌표·크기 오버라이드 지원
- **외부 웹 사이트 바로가기**: `http(s)://` 외부 URL을 OS 내부 창(`openMode: 'window'`) 또는 브라우저 새 탭(`openMode: 'new-tab'`)으로 실행하며, 외부 창 타이틀바에 '새 탭에서 열기' 버튼과 Cross-Origin 안전 리로드 제공

### 바탕화면 그리드 & 아이콘
- **반응형 균등 그리드**: 데스크탑 영역 크기에 맞춰 정사각형에 가까운 `cols × rows` 그리드를 자동 계산하고, 셀 크기에 비례해 아이콘 타일·글리프·라벨을 스케일링
- **그리드 배율 조절 (`Ctrl + Wheel`)**: 짧은 변 기준 셀 개수(`3 ~ 14`, `localStorage` 저장)를 1칸씩 실시간 증감하며, 조절 중 Ghost 격자 오버레이와 배율 배지 표시
- **드래그 앤 드롭 배치**: 포인터 드래그 시 Ghost 격자 및 드롭 대상 셀을 하이라이트하고, 드롭 시 빈 셀 이동 또는 기존 아이콘과 위치 교환(`localStorage` 저장)
- **스쿼클 타일 & 하이브리드 아이콘**: 연속 곡률 SVG 스쿼클 타일에 8종 컬러 톤 프리셋(`neutral`, `primary`, `secondary`, `blue`, `amber`, `rose`, `violet`, `teal`) 적용, 커스텀 SVG·Lucide 아이콘 자동 분기, 외부 링크 배지 및 1줄 말줄임·전체 이름 툴팁 지원

### 태스크바
- **시작 메뉴 & 앱 런처 (`fdPlatter` / `StartMenu`)**: 좌측 하단 `fdPlatter` 버튼 클릭 시 시작 메뉴 팝업 패널을 열어 등록된 `builtin` / `sample` / `work` (`All` / `Builtin` / `Sample` / `Work`) 앱 검색·필터링·실행(기본 실행 및 `+` 새 인스턴스 창 생성) 및 열린 창 일괄 제어(바둑판·계단식 정렬, 모두 최소화·복원, 모두 닫기) 지원
- **활성 창 탭 목록**: 열린 모든 창의 아이콘·제목·Z-Index·상태를 실시간 표시하고, 탭 클릭 시 **포커스 전환 / 최소화 / 복원** 스마트 토글
- **시스템 트레이**: 열린 창 일괄 정렬 버튼(바둑판식 Tile / 계단식 Cascade / 모두 최소화·복원 토글) 및 실시간 시계 표시

### 윈도우 매니저
- **창 생명주기 및 포커스 제어**: 창 열기, 닫기, 최소화, 최대화/복원, Z-Index 순차 정렬 및 차상위 창 포커스 자동 이관, 바탕화면 클릭 시 전체 포커스 해제
- **비활성 `iframe` 첫 클릭 포커스**: 포커스되지 않은 Same-origin 도메인 앱 창 내부를 클릭하면 즉시 해당 창으로 포커스 전환
- **창 이동 및 8방향 리사이징**: 드래그 이동 및 8방향 크기 조절(OS 기본 최소 크기 `320×220` 및 앱 매니페스트별 `minWidth`/`minHeight` 지정 지원), 드래그 중 `iframe` 포인터 간섭 방지
- **창 스냅 & 분할 가이드 (Window Snapping)**: 화면 좌/우/상단 가장자리 드래그 시 반투명 Ghost 프리뷰를 표시해 좌/우 50% 분할 또는 최대화 배치를 지원하며, 스냅·최대화된 창을 다시 드래그하면 이전 크기·위치(`restoreRect`)로 자동 복원
- **빈 창 런처 & In-place 앱 전환 (`WindowEmptyView` / `replaceWindow`)**: 바탕화면 `+ New Window` 실행 시 미니멀한 빈 창(`appUrl: ''`)이 열리며, 중앙 앱 아이콘을 선택하면 창 ID·Z-Index·포커스·스냅/최대화 배치를 유지한 채 해당 앱으로 즉시 전환
- **창 로딩 뷰 & 깜빡임(FOUC) 방지 (`WindowLoadingView`)**: 도메인 앱 `iframe` 초기 로드·전환·단독 새로고침 중 다크 에스프레소 배경(`#1a1613`)과 앱 아이콘·스피너 로딩 화면을 표시하고, `@ferdy/bridge`의 `FERDY_SET_WINDOW_LOADING` (`ferdyBridge.setWindowLoading`)으로 앱 내부에서 소속 창의 로딩 상태를 켜고 끌 수 있으며 Core/도메인 HTML `<head>` 인라인 다크 테마 및 초기 뷰포트 동기화로 새로고침 깜빡임 방지
- **창 세션 유지 (`localStorage`) & 일괄 정렬**: 새로고침 시 열려 있던 창들의 좌표·크기·최소화/최대화/스냅·포커스·Z-Index 상태를 자동 복원(`ferdy.window.session`)하며, 화면에 보이는 창들의 바둑판식(Tile)·계단식(Cascade) 정렬 및 모두 최소화(바탕화면 보기 토글) 지원
- **활성 창 단독 새로고침 (`F5`, `Ctrl+R`, `Cmd+R`)**: 포커스된 창에서 새로고침 단축키 입력 시 브라우저 전체 리로드를 막고 해당 창 `iframe`만 리로드 (포커스된 창이 없을 때는 기본 브라우저 새로고침 유지)

---

## 2. Domain Apps (`packages/domains/**`)

모든 도메인 앱은 `<iframe sandbox>` 내부에서 역할별 카테고리(`builtin/`, `sample/`, `work/`)로 분리되어 멀티 프레임워크(SolidJS · React 19 · Vue 3)로 독립 실행되며, `@ferdy/ui`(또는 비-Solid 앱용 `@ferdy/ui/styles.css`) 디자인 토큰과 `@ferdy/bridge` 이벤트 버스를 통해 OS와 일관된 경험 및 통신을 제공합니다. `work/` 앱들은 `[E] Externs` 계층(`@ferdy/extern-task`)을 통해 프레임워크를 넘나드는 실시간 창 간 동기화를 지원합니다.

| 카테고리 | 앱 이름 | 패키지 / 경로 | 핵심 기능 |
| :--- | :--- | :--- | :--- |
| `builtin` | **Clock** | `@ferdy/builtin-clock`<br>`/domains/builtin/clock/` | `@ferdy/ui` 토큰 기반 실시간 디지털 시계 및 `24H` / `12H` 포맷 전환 위젯 앱 |
| `builtin` | **Calendar** | `@ferdy/builtin-calendar`<br>`/domains/builtin/calendar/` | 월간 캘린더 탐색, 오늘(Today) 이동, 선택 일자 D-Day 표시 및 날짜별 한 줄 메모(`localStorage` 저장·셀 도트 인디케이터) 지원 위젯 앱 |
| `builtin` | **Notes** | `@ferdy/builtin-notes`<br>`/domains/builtin/notes/` | 좌측 사이드바 기반 다중 메모 관리(추가/전환/삭제), `localStorage` 실시간 자동 저장, `Edit` ↔ `Preview` 마크다운 미리보기 전환 및 글꼴 크기 조절(`11px ~ 28px`) 지원 앱 |
| `sample` | **Sample App** | `@ferdy/sample-app`<br>`/domains/sample/app/` | `@ferdy/ui` 컴포넌트(`Button`, `Badge`)와 `@ferdy/bridge`(`ping`, `openWindow`, `setWindowLoading` 3초 로딩 테스트) 통신을 시연하는 표준 레퍼런스 앱 |
| `sample` | **Hello World** | `@ferdy/sample-hello`<br>`/domains/sample/hello/` | 최소 구성(Minimal) 도메인 앱 구조 및 공통 스타일시트 연동 검증 앱 |
| `work` | **Task Board (React)** | `@ferdy/work-task-react`<br>`/domains/work/task-react/` | React 19 + `@ferdy/extern-task` 기반 업무·개인 Task 보드 앱 (상태별 카운터, 빠른 추가 폼, 상태/분류/검색 필터, 원클릭 상태 순환, `ferdyBridge.openWindow` 기반 `[Compare with Vue]` 창 실행 및 실시간 창 간 동기화) |
| `work` | **Task Board (Vue)** | `@ferdy/work-task-vue`<br>`/domains/work/task-vue/` | Vue 3 (`<script setup lang="ts">`) + `@ferdy/extern-task` 기반 업무·개인 Task 보드 앱 (React 앱과 동일 스펙, `[Compare with React]` 창 실행 및 실시간 창 간 동기화) |

---

## 3. External Storage & I/O Adapters (`packages/externs/**`)

도메인 앱이 저장소나 원격 API 세부 구현에 직접 결합되지 않도록, **`[E] Externs`** 계층이 순수 계약(`Promise` 기반 서비스 인터페이스)과 외부 I/O 어댑터를 분리하여 제공합니다.

- **`@ferdy/extern-task` (`packages/externs/task/`)**:
  - **공개 계약 (`TaskExternService`)**: `listTasks`, `createTask`, `updateTask`, `cycleTaskStatus`, `deleteTask`, `resetToSeed`, `subscribe` 메서드 및 `TaskItem` / `TaskStatus` / `TaskPriority` / `TaskCategory` 모델 제공
  - **내부 어댑터 캡슐화**: `localStorage`(`ferdy:extern:tasks`) 영속화, `BroadcastChannel('ferdy:extern:task')` 및 `window` `storage` 이벤트를 활용한 동일 오리진 내 다중 `iframe` 창(React ↔ Vue 등) 간 실시간 동기화, 초기 시드 데이터(6종) 복원 지원

---

## 4. Roadmap (향후 방향)

세부 작업 항목과 아이디어는 [todo.md](./todo/todo.md)에서 관리하며, 중장기 주요 마일스톤은 다음과 같습니다.

- **테마 시스템 고도화**: `FERDY_THEME_CHANGE` 브로드캐스트 기반 런타임 다크/라이트 테마 전환 및 추가 테마 세트 지원
- **Window Manager UX 고도화**: App ↔ Window 양방향 브릿지 제어 및 앱별 창 정책 확장
- **시스템 · 유틸리티 도메인 앱 확장**: 브릿지 이벤트/창 인스펙터(`builtin-monitor`), OS 환경설정(`builtin-settings`) 등 실용 앱 추가
