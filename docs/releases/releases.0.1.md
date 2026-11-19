# Release Notes — 0.1.x

[← 전체 릴리즈 목차 (`releases.md`)](./releases.md)

**Ferdy Platter (FerdyOS)** `0.1.x` 마이너 버전 시리즈의 상세 변경 이력입니다.

---

## [0.1.8] - Multi-Framework MPA (React & Vue) & Externs Layer (WIP)

### Added
- **Task 외부 저장·동기화 어댑터 패키지 (`@ferdy/extern-task`, `packages/externs/task/`) 신설**:
  - `src/fdExtern.task.ts`: 활성 어댑터 바인딩과 공개 퍼사드(`taskExternService`)를 정의하는 대표 진입 모듈 구현
  - `src/fdExtern.task.type.ts`: `TaskStatus`, `TaskPriority`, `TaskCategory`, `TaskItem`, `CreateTaskInput`, `UpdateTaskPatch` 모델 및 비동기(`Promise`) 기반 `TaskExternService` 계약 인터페이스 정의
  - `src/fdExtern.task.adapter.ts`: `localStorage`(`ferdy:extern:tasks`) JSON 영속화 및 `BroadcastChannel('ferdy:extern:task')` + `window` `storage` 이벤트를 활용한 동일 오리진 다중 `iframe` 창 간 실시간 동기화 구현체(`createLocalStorageTaskAdapter`) 캡슐화
  - `src/fdExtern.task.util.ts` & `src/fdExtern.task.seed.ts`: 입력 정규화·상태 전이·타입 가드 순수 유틸리티 및 초기 데모 시드 데이터(6종) 분리
  - `src/index.ts`: 도메인 앱에는 공개 타입과 `taskExternService` 싱글턴만 노출하고 내부 구현(`adapter`/`util`/`seed`)은 캡슐화
- **`@ferdy/tsconfig` React / Vue 멀티 프레임워크 프리셋 신설 (`packages/base/tsconfig/`)**:
  - `react.json`: `./base.json` 확장 후 `jsx: "react-jsx"`, `jsxImportSource: "react"` 오버라이드
  - `vue.json`: `./base.json` 확장 후 `jsx: "preserve"`, `jsxImportSource: "vue"` 오버라이드
  - `package.json`의 `exports` 및 `files`에 `./react.json`, `./vue.json` 등록

### Changed
- **워크스페이스 버전 상향 (`0.1.7` → `0.1.8`)**:
  - 루트 및 전체 패키지(`@ferdy/assets`, `@ferdy/bridge`, `@ferdy/tsconfig`, `@ferdy/ui`, `@ferdy/core`, `@ferdy/builtin-*`, `@ferdy/sample-*`)의 `package.json` 및 시작 메뉴 버전 배지를 `0.1.8`로 일괄 업데이트
- **`[E]` 레이어 전환 (`packages/etc` → `packages/externs/*`)**:
  - 루트 `package.json`의 `workspaces`에서 `"packages/etc/*"`를 `"packages/externs/*"`로 전환하고 기존 빈 `packages/etc` 디렉토리를 정리하여 외부 I/O 전담 `[E] Externs` 계층 정립
- **단일 Vite 게이트웨이 멀티 프레임워크 플러그인 스코핑 (`packages/core/`)**:
  - `@vitejs/plugin-react`, `@vitejs/plugin-vue` `devDependencies` 추가 및 `vite.config.ts`에서 `vite-plugin-solid`(`exclude`로 React/Vue 도메인 앱 경로 제외), `@vitejs/plugin-react`(`include`로 `packages/domains/work/task-react/**` 전담), `@vitejs/plugin-vue`(`.vue` SFC 전담) 스코핑 구성
- **`work` 앱 카테고리 확장 (`packages/core/`)**:
  - `fdCore.app.type.ts`의 `AppCategory`를 `'builtin' | 'sample' | 'work'`로 확장하고, 시작 메뉴(`fdShell.taskbar.start.tsx`)에 `Work` 필터 탭 및 `Work Apps` 섹션 반영

### Fixed
- *(작업을 진행하며 수정될 사항 기록)*

---

## [0.1.7] - Window Snapping, Session Persistence & Layout Actions, Start Menu, Empty & Loading Window Views

### Added
- **창 스냅 및 분할 가이드 (`Window Snapping`, `@ferdy/core`)**:
  - 창 타이틀바를 바탕화면 좌/우/상단 가장자리(`20px` 이내)로 드래그할 때 반투명 Ghost 프리뷰 오버레이(`WindowSnapGhost`, `fdShell.window.ghost.tsx`)와 분할 안내 배지 표시
  - 드롭 시 좌/우 50% 분할(`snapZone: 'left' | 'right'`) 또는 최대화(`isMaximized: true`)로 자동 배치하고, 스냅 이전의 창 좌표·크기(`restoreRect`) 보존
  - 스냅 또는 최대화된 창을 타이틀바에서 다시 드래그(`4px` 이상 이동)하면 커서 비율에 맞춰 이전 크기(`restoreRect`)로 자연스럽게 분리·복원(`unsnapWindow`), 뷰포트 리사이즈 시 스냅된 창 크기 자동 동기화(`syncSnappedWindows`) 지원
- **창 상태 `localStorage` 세션 유지 및 열린 창 일괄 정렬 (`@ferdy/core`)**:
  - `fdCore.window.store.ts`에 `ferdy.window.session` 기반 열린 창 세션 자동 저장(드래그·리사이징 인터랙션 종료 시점 및 창 상태 변경 시점) 및 새로고침 시 위치·크기·최소화/최대화/스냅·포커스·Z-Index 정규화 복원(`loadInitialWindowSession`) 구현
  - 화면에 보이는 창들을 격자로 빈틈없이 분할 배치하는 바둑판식 정렬(`tileWindows`), 좌상단부터 대각선으로 배치하는 계단식 정렬(`cascadeWindows`), 열린 창 전체 최소화 및 이전 상태 복원 토글(`toggleMinimizeAllWindows`) 액션 추가
  - 태스크바 우측 트레이(`fdShell.taskbar.tsx`)에 바둑판식 정렬(`layout-grid`), 계단식 정렬(`layers`), 모두 최소화/복원(`minimize-2`) 빠른 실행 아이콘 버튼 추가
- **시작 메뉴 / 앱 런처 팝업 (`StartMenu`, `@ferdy/core`)**:
  - 좌측 하단 `fdPlatter` 시작 버튼 클릭 시 등록된 `builtin` / `sample` 도메인 앱을 탐색·실행할 수 있는 글래스모피즘 시작 메뉴 패널(`fdShell.taskbar.start.tsx`, `fdShell.taskbar.start.css`) 오픈
  - `<fd.TextField>` 기반 실시간 앱 검색(`Enter` 입력 시 첫 번째 결과 즉시 실행) 및 카테고리 필터 탭(`All` / `Builtin` / `Sample`), 앱별 실행 중인 창 개수 인디케이터, 기본 실행/포커스 및 우측 `+` 새 인스턴스 창 열기 버튼 지원
  - 하단 푸터에 열린 창 일괄 제어 퀵 액션(바둑판 정렬, 계단식 정렬, 모두 최소화/복원, 모두 닫기 `closeAllWindows`) 제공 및 외부 클릭·`Escape`·`iframe` 포커스 전환 시 자동 닫힘 처리
- **빈 창 런처 및 In-place 창 전환 (`WindowEmptyView` & `replaceWindow`, `@ferdy/core`)**:
  - 바탕화면 `+ New Window` 클릭 시 `sample-app` 하드코딩 실행 대신 `windowStore.openEmptyWindow()`로 미니멀한 빈 창(`Empty`, `appUrl: ''`)을 생성하고, `WindowWrapper` 내장 뷰(`fdShell.window.empty.tsx`)로 등록된 앱 아이콘 타일을 표시
  - 빈 창에서 앱 선택 시 `appStore.launchAppInWindow` / `windowStore.replaceWindow`를 통해 창 ID·Z-Index·포커스·스냅/최대화 상태를 유지한 채 해당 앱으로 즉시 전환(일반 창은 위치 유지·앱 기본 크기 적용, 스냅/최대화 창은 현재 배치 유지·`restoreRect` 갱신, 다중 실행 시 인스턴스 제목 및 `?instance=N` 자동 부여)
- **창 로딩 뷰 (`WindowLoadingView`), 브릿지 로딩 제어 및 새로고침 깜빡임(FOUC) 방지 (`@ferdy/bridge`, `@ferdy/core`, `@ferdy/sample-app`)**:
  - `useWindowIframe` 훅(`fdShell.window.hooks.ts`)에 `isIframeLoading` 상태를 추가하여 창 최초 로드, 빈 창 → 앱 전환, 창 단독 새로고침(`F5` / `Ctrl+R`) 시 앱 아이콘 타일과 스피너 링을 담은 로딩 오버레이(`fdShell.window.loading.tsx`)를 표시하고 로드 완료 후 부드럽게 페이드 전환
  - `@ferdy/bridge`에 `FERDY_SET_WINDOW_LOADING` 이벤트와 `ferdyBridge.setWindowLoading(loading, { message, windowId })` 헬퍼를 추가하고, Core 브릿지 서비스(`fdCore.bridge.service.ts`)에서 발신 `iframe`(`rawEvent.source`)을 역추적해 해당 창의 로딩 오버레이(`windowStore.setWindowLoading`)와 안내 문구를 동적으로 제어하도록 연동
  - `@ferdy/sample-app`(`appSample.tsx`)에 클릭 시 3초간 부모 창 로딩 오버레이를 활성화했다가 자동 해제하는 `3s Window Loading` 데모 버튼 추가
  - Core(`packages/core/index.html`) 및 모든 도메인 앱(`packages/domains/**/index.html`) `<head>`에 `color-scheme: dark` 및 인라인 다크 에스프레소 배경 스타일(`#120f0d` / `#1a1613`)을 적용하고, `createMonorepoDomainsGateway`에서 미지정 HTML에도 프리로드 다크 스타일을 자동 주입해 CSS 로드 전 하얀 화면 깜빡임 제거
  - `fdCore.desktop.store.ts` 초기 뷰포트 크기를 고정값(`1280×720`) 대신 실제 브라우저 창 크기로 초기화하여 새로고침 직후 바탕화면 아이콘 그리드 재배치 깜빡임 완화

### Changed
- **워크스페이스 버전 상향 (`0.1.6` → `0.1.7`)**:
  - 루트 및 전체 패키지(`@ferdy/assets`, `@ferdy/bridge`, `@ferdy/tsconfig`, `@ferdy/ui`, `@ferdy/core`, `@ferdy/builtin-*`, `@ferdy/sample-*`)의 `package.json` 버전을 `0.1.7`로 일괄 업데이트
- **`window` 서비스 계층 분리 및 뷰포트 헬퍼 통합 (`@ferdy/core`)**:
  - `fdCore.window.store.ts`에서 세션 직렬화/복원 및 스냅·타일·캐스케이드 좌표 계산 순수 로직을 `fdCore.window.service.ts`로 분리
  - `desktopStore.getViewportSize()` 헬퍼를 신설해 태스크바·시작 메뉴·창 드래그 훅의 뷰포트 크기 폴백 계산을 단일화
- **Builtin 앱 아이콘 컬러 톤 통일 (`@ferdy/core`)**:
  - `fdCore.app.manifest.meta.ts`에서 Builtin 도메인 앱(`Clock`, `Calendar`, `Notes`)의 기본 아이콘 컬러 톤을 `'blue'`에서 `'secondary'`(포레스트 그린)로 통일
- **태스크바 트레이 및 바탕화면 외부 링크 배지 UI 개선 (`@ferdy/core`)**:
  - 태스크바 우측 트레이의 `Windows: N` 상태 배지를 제거하고 시계 폰트를 `Pretendard` (`--fd-font-sans`)로 변경
  - 바탕화면 아이콘(`fdShell.desktop.icon.tsx`, `fdShell.desktop.icon.css`)의 외부 링크 배지(`.os-desktop-icon-badge`)와 내부 아이콘 크기를 그리드 타일 및 `iconSize`에 비례하여 확대/축소되도록 개선
- **릴리즈 마감 스킬 신설 (`.agents/skills/finalize-release/SKILL.md`)**:
  - 버전 정리, `README.md` 및 `docs/` 동기화, 커밋·푸시 절차를 표준화한 에이전트 스킬 추가

### Fixed
- **최대화 창 높이 이중 차감 보정 (`@ferdy/core`)**:
  - `.os-window-layer`가 이미 태스크바를 제외한 `.os-desktop` 내부에 배치되어 있으므로 `isMaximized` 창의 높이를 `calc(100% - var(--core-taskbar-height))`에서 `100%`로 수정하여 하단 빈 여백 제거
  - 최대화 버튼/더블클릭 복원 시에도 `restoreRect`를 통해 이전 좌표·크기를 일관되게 복원하도록 보완

---

## [0.1.6] - Builtin Apps (Calendar & Notes), Desktop Grid & Tones, UI/Core/Domains Architecture Standardization

### Added
- **월간 달력 도메인 앱 (`@ferdy/builtin-calendar`) 신설**:
  - `packages/domains/builtin/calendar/` 패키지 생성 (`420x490` 기본 창 크기, `/domains/builtin/calendar/` 경로 서빙)
  - 7열 × 6행(42셀) 월간 달력 그리드 렌더링, 이전/다음 달 탐색 및 `Today` 즉시 복귀 기능 구현
  - 선택 날짜(`YYYY-MM-DD (DAY)`) 및 오늘 기준 상대 D-Day 배지(`TODAY`, `D-N`, `D+N`) 표시
  - `<fd.TextField>` 기반 날짜별 한 줄 메모 입력/삭제 및 `ferdy:calendar:memos` Draft `localStorage` 헬퍼(`common/calendar.storage.ts`) 연동, 메모 보유 날짜 셀(`.has-memo`) 하단 도트(dot) 인디케이터 및 툴팁 표시
  - `common/` (`calendar.storage.ts`, `calendar.types.ts`, `calendar.utils.ts`) 및 `components/` (`CalendarHeader`, `CalendarGrid`, `CalendarFooter`) 모듈화 구성
  - Core 앱 매니페스트(`BUILTIN_APP_MANIFESTS`, 아이콘 `'calendar'`) 및 바탕화면 바로가기(`INITIAL_DESKTOP_SHORTCUTS`) 등록
- **메모장 도메인 앱 (`@ferdy/builtin-notes`) 신설**:
  - `packages/domains/builtin/notes/` 패키지 생성 (`660x460` 기본 창 크기, 최소 `380x280` 본문 기준 `382x320` 창 크기, `/domains/builtin/notes/` 경로 서빙)
  - 접기/펼치기 가능한 좌측 사이드바 기반 다중 메모 관리(추가/전환/삭제, 마지막 메모 삭제 시 빈 새 메모 자동 생성) 및 `localStorage`(`ferdy:notes:items`, `ferdy:notes:active-id`) 실시간 자동 저장 구현
  - 상단 툴바 `Edit` ↔ `Preview` 모드 전환 토글, `Tab` 2칸 들여쓰기 및 자체 경량 마크다운 렌더러(제목, 코드 블록, 인라인 코드, 강조/취소선, 인용구, 목록, 체크리스트, 구분선, 안전 링크) 구현
  - `Edit` 모드 글자 크기 조절(`11px ~ 28px`, 하단 `-` / `14px` / `+` 컨트롤 및 `Ctrl/Cmd + +/-/0` 단축키) 및 `ferdy:notes:font-size` `localStorage` 저장 지원
  - Core 앱 매니페스트(`BUILTIN_APP_MANIFESTS`, 아이콘 `'notebook-pen'`) 및 바탕화면 바로가기(`INITIAL_DESKTOP_SHORTCUTS`) 등록
- **`@ferdy/ui` 입력 컴포넌트 (`<fd.Input>`, `<fd.TextField>`) 추가**:
  - `components/input/` (`fdCompo.input.tsx`, `fdCompo.input.css`)에 `variant` (`'default' | 'ghost'`), `size` (`'sm' | 'md'`)를 지원하는 `<fd.Input>` (`Input` / `FdInput`) 구현
  - `components/text-field/` (`fdCompo.textField.tsx`, `fdCompo.textField.css`)에 좌측 아이콘(`leftIcon`), 지우기 버튼(`clearable`, `clearLabel`, `onClear`)을 제공하는 복합 입력 필드 `<fd.TextField>` (`TextField` / `FdTextField`) 구현
- **공유 TypeScript 설정 패키지 (`@ferdy/tsconfig`) 신설**:
  - `packages/base/tsconfig/`에 브라우저/SolidJS 앱용 `base.json` 및 Node/Vite 설정용 `node.json` 분리 정의
  - 루트 `@types/node` 추가 및 Core/도메인 앱별 `tsconfig.node.json` 분리 구성
- **앱별 최소 창 크기(`minWidth`, `minHeight`) 지원 (`@ferdy/core`)**:
  - `AppManifest.defaultWindow`, `DesktopShortcut`, `LaunchAppOptions`, `WindowInstance`에 `minWidth` / `minHeight` 옵션을 추가해 앱별로 OS 기본값(`320x220`) 외의 최소 크기 제한을 지정할 수 있도록 확장
  - `@ferdy/builtin-calendar`에 본문 기준 최소 `280x310`(`창 전체 282x350`, 타이틀바 `38px` 및 프레임 보더 `2px` 포함), `@ferdy/builtin-notes`에 본문 기준 최소 `380x280`(`창 전체 382x320`) 최소 크기 제약 적용
- **외부 웹 사이트 바로가기 지원 (`@ferdy/core`)**:
  - `DesktopShortcut` / `LaunchAppOptions`에 `openMode` (`'window'` | `'new-tab'`) 지원 및 외부 URL(`http://`, `https://`) 판별(`isExternalUrl`)·새 탭 실행(`openInNewTab`) 추가
  - `fdShell.desktop.icon.tsx` 외부 링크 배지(`'external-link'`), `fdShell.window.titlebar.tsx` 외부 창 타이틀바 '새 탭에서 열기' 액션 버튼 및 Cross-Origin `iframe` 안전 리로드 처리 구현
  - 바탕화면 `Cube Timer` 외부 바로가기(`icon: 'timer'`, `tone: 'violet'`) 등록
- **반응형 바탕화면 아이콘 그리드 및 드래그 앤 드롭 배치 (`@ferdy/core`)**:
  - `ResizeObserver` 기반 정사각형 그리드 자동 분할(`fdCore.desktop.store.ts`, `fdCore.desktop.type.ts`) 및 셀 크기에 비례한 아이콘 타일·글리프·라벨 스케일링 구현
  - 바탕화면 `Ctrl + Wheel`로 짧은 변 기준 셀 개수(`3 ~ 14`, `localStorage` 저장) 조절, Ghost 격자 오버레이(`fdShell.desktop.ghost.tsx`) 및 배율 배지 표시
  - 포인터 드래그 시 드롭 대상 셀 하이라이트 및 빈 셀 이동·기존 아이콘과 위치 교환(`localStorage` 저장) 지원
- **바탕화면 아이콘 컬러 톤 프리셋 시스템 (`@ferdy/core`)**:
  - `fdCore.app.tones.meta.ts`에 8종 컬러 톤 프리셋(`neutral`, `primary`, `secondary`, `blue`, `amber`, `rose`, `violet`, `teal`) 신설 및 CSS 변수 기반 스쿼클 타일 테마 적용
  - 앱 매니페스트(`AppManifest.tone`) 및 바로가기(`DesktopShortcut.tone`)별 개별 컬러 톤 지정 지원

### Changed
- **워크스페이스 버전 상향 (`0.1.5` → `0.1.6`)**:
  - 루트 및 전체 패키지(`@ferdy/assets`, `@ferdy/bridge`, `@ferdy/tsconfig`, `@ferdy/ui`, `@ferdy/core`, `@ferdy/builtin-*`, `@ferdy/sample-*`)의 `package.json` 버전을 `0.1.6`으로 일괄 업데이트
- **도메인 앱 카테고리 계층화 및 엔트리 컨벤션 통일 (`packages/domains/**`, `@ferdy/core`)**:
  - 도메인 앱을 성격에 따라 `packages/domains/builtin/*` (`calendar`, `clock`, `notes`) 및 `packages/domains/sample/*` (`app`, `hello`)로 카테고리 그룹화하고 패키지명을 `@ferdy/<category>-<name>`으로 전환
  - 서빙 경로를 `/domains/<category>/<app-name>/`으로 전환하고 `AppManifest.category` (`'builtin' | 'sample'`) 및 `BUILTIN_APP_MANIFESTS` / `SAMPLE_APP_MANIFESTS` 구분 도입
  - 모든 도메인 앱의 엔트리 및 메인 컴포넌트 파일 구조를 `src/main.tsx` + `src/app<Name>.tsx` / `.css` 컨벤션으로 통일하고 개별 `vite.config.ts`의 하드코딩 포트를 제거
- **Core 셸/서비스 네이밍 표준화 및 게이트웨이 플러그인 분리 (`@ferdy/core`)**:
  - Vite 도메인 게이트웨이를 `packages/core/plugins/monorepoDomainsGateway.ts` (`createMonorepoDomainsGateway`)로 분리하고 `/domains/` 마운트 및 재귀 스캔 적용
  - 파일 네이밍을 UI 셸(`fdShell.<domain>.*`)과 엔진·스토어·서비스·메타·타입(`fdCore.<domain>.store.ts`, `fdCore.<domain>.service.ts`, `fdCore.app.*.meta.ts`, `fdCore.<domain>.type.ts`)으로 통일
  - `desktop/`과 `window/` 컴포넌트를 서브 컴포넌트(`fdShell.desktop.ghost.tsx`, `fdShell.desktop.icon.*`, `fdShell.window.titlebar.tsx`) 및 훅(`fdShell.desktop.hooks.ts`, `fdShell.window.hooks.ts`)으로 세분화하고 브릿지 수신 로직을 `fdCore.bridge.service.ts`로 분리
- **`@ferdy/ui` CSS `@layer` 6계층 개편 및 타이포그래피 통일 (`@ferdy/ui`, `@ferdy/builtin-clock`, `@ferdy/builtin-calendar`, `@ferdy/builtin-notes`)**:
  - CSS Cascade Layers를 `@layer reset, tokens, theme, libraries, base, components;` 6계층으로 재정비 (`fdStyle.token.css`, `fdStyle.reset.css`, `components/fdCompo.style.css` 도입 및 `fdStyle.layout.css` / `fdStyle.utilities.css` 제거)
  - `@ferdy/builtin-clock`, `@ferdy/builtin-calendar`, `@ferdy/builtin-notes`의 숫자 표기에 `Pretendard Variable` (`--fd-font-sans`)과 `font-variant-numeric: tabular-nums`를 적용하고, 달력 앱에 창 크기 연동 `clamp()` 반응형 스케일링 적용
- **`@ferdy/bridge` 모듈 분리 (`packages/base/bridge`)**:
  - `fdBase.bridge.ts`, `fdBase.bridge.type.ts`, `fdBase.bridge.util.ts`, `index.ts`로 구현·타입·유틸리티·진입점 분리
- **`@ferdy/assets` 정적 파일 경로 전용화 (`packages/assets`, `@ferdy/core`)**:
  - `FERDY_ASSETS`를 정적 파일 경로 상수(`FERDY_ASSETS.paths`) 전용으로 축소하고, Lucide 아이콘 이름은 Core 매니페스트/컴포넌트에서 직접 문자열로 지정하도록 전환 (기존 `app-sample.svg` → `sample-app.svg` 정리)

### Fixed
- **비활성 `iframe` 창 첫 클릭 포커스 전환 및 드래그 클린업 보강 (`@ferdy/core`)**:
  - 포커스되지 않은 Same-origin 도메인 앱 창(`iframe`) 내부를 처음 클릭할 때 즉시 해당 창으로 포커스가 전환되도록 개선 (`fdShell.window.hooks.ts`, `fdCore.window.store.ts`)
  - 창 드래그 및 리사이징 인터랙션 종료 시 이벤트/상태 정리(Cleanup) 로직 보강

---

## [0.1.5] - App Manifest Registry (`services/app/`), `.meta.ts` Convention & Brand Identity (`fdPlatter`)

### Added
- **App/Window 서비스 계층(`services/`) 분리 및 `.meta.ts` 파일 규칙 도입 (`@ferdy/core`)**:
  - `packages/core/src` 하위를 `components/`(UI 뷰), `services/`(도메인별 상태·메타데이터), `types/`(타입 정의) 3계층으로 개편
  - 메타 정보를 저장하는 파일은 접미사로 `.meta.ts`를 붙이고 **한 파일에 한 종류의 데이터만 관리**하도록 규칙 수립:
    - `packages/core/src/services/app/fdRegist.apps.manifest.meta.ts`: 초기 등록된 도메인 앱 매니페스트 목록(`INITIAL_APP_MANIFESTS`: `app-sample`, `app-clock`, `app-hello`) 단독 관리
    - `packages/core/src/services/app/fdRegist.apps.shortcuts.meta.ts`: 바탕화면 기본 바로가기 목록(`INITIAL_DESKTOP_SHORTCUTS`) 단독 관리
  - `packages/core/src/services/app/fdStore.app.ts`: 앱 조회(`getApp`, `getAppList`), 동적 등록(`registerApp`), 바로가기 메타정보 병합 해석(`resolveShortcut`), `appId` 기반 창 실행(`launchApp`) 및 바로가기 실행(`openShortcut`) 액션 구현
  - `packages/core/src/services/window/fdStore.window.ts`: 기존 창 관리 스토어를 `services/window/` 하위로 이동 및 최소 창 크기 상수(`MIN_WINDOW_WIDTH`, `MIN_WINDOW_HEIGHT`), 포커스 이관 내부 헬퍼(`focusWindowInDraft`, `focusNextTopWindowInDraft`) 통합
  - `packages/core/src/types/fdType.app.ts`: `AppManifest`, `DesktopShortcut`, `LaunchAppOptions` 타입 정의 추가
- **브랜드 로고(`ferdy.svg`) 추가 및 `@ferdy/app-hello` 도메인 앱 등록 (`@ferdy/assets`, `@ferdy/core`, `@ferdy/app-hello`)**:
  - `packages/assets/public/assets/logo/ferdy.svg` 정식 브랜드 로고 SVG 추가 및 `FERDY_ASSETS.paths.logoSvg` 경로 연결 (기존 미사용 `ferdy-logo.svg` 및 `logoSymbol` 제거)
  - Core `index.html` 파비콘, 하단 태스크바 런처 버튼(`fdPlatter` 브랜드명 + 로고 아이콘), `@ferdy/app-hello` 본문에 `ferdy.svg` 적용
  - 최소 구성 도메인 앱인 `app-hello`를 `INITIAL_APP_MANIFESTS` 및 `INITIAL_DESKTOP_SHORTCUTS`에 정식 연결하고 `@ferdy/assets`에 `FERDY_ASSETS.icons.hello` (`'hand'`) 아이콘 상수 추가
- **활성 창 단독 새로고침 (`F5`, `Ctrl+R`, `Cmd+R`) 및 포커스 해제 (`@ferdy/core`)**:
  - `WindowWrapper` (`fdShell.windowWrapper.tsx`)에서 `iframe`의 `onLoad` 시점에 내부 `contentWindow` 및 호스트 창의 새로고침 단축키(`F5`, `Ctrl+R`, `Cmd+R`)를 가로채어 전체 OS가 아닌 해당 창의 `iframe`만 새로고침되도록 구현
  - 바탕화면 영역(`fdShell.desktop.tsx`) 클릭 시 모든 창의 포커스를 해제(`windowStore.blurAllWindows`)하여, 창에 포커스가 없을 때는 기존처럼 브라우저 전체 새로고침이 동작하도록 지원

### Changed
- **바탕화면(`Desktop`) 및 태스크바(`Taskbar`) 하드코딩 제거**:
  - `fdShell.desktop.tsx` 내부에 하드코딩되어 있던 `SHORTCUTS` 배열을 제거하고 `appStore.state.shortcuts` 및 `appStore.resolveShortcut` / `appStore.openShortcut` / `appStore.launchApp`을 사용하도록 리팩토링
  - 바로가기에서 `appId`만 지정하면 매니페스트의 기본 제목/아이콘/URL/창 크기를 자동 상속받고, 필요 시 `queryParams` (`{ instance: 2 }`), 제목, 아이콘, 좌표/크기만 선택적으로 오버라이드하도록 개선
- **`@ferdy/bridge` `FERDY_OPEN_WINDOW` 프로토콜 확장**:
  - 자식 앱에서 새 창 생성을 요청할 때 직접 `appUrl`을 조합하는 대신 `appId`와 `queryParams`를 전달해 Core의 앱 레지스트리 기본값을 활용할 수 있도록 확장

---

## [0.1.4] - Desktop Squircle Icons, Typography (`Pretendard` + `D2Coding`) & Core Component Refactoring

### Added
- **SVG 초타원(Superellipse) 바탕화면 스쿼클 아이콘 (`DesktopIcon`) 및 하이브리드 아이콘 렌더러 (`AppIcon`)**:
  - `packages/assets/public/assets/icons/app-sample.svg`에 FerdyOS 컬러 테마(테라코타·포레스트 그린·웜 크림)를 반영한 입체 아이소메트릭 큐브 SVG 아이콘 추가
  - `AppIcon` (`packages/core/src/components/common/fdShell.appIcon.tsx`): SVG 정적 경로(`/assets/...svg`)와 `@ferdy/ui` Lucide 아이콘 이름(`'clock'`, `'rocket'`, `'plus'`)을 자동 판별하여 렌더링하는 공통 컴포넌트 구현
  - `DesktopIcon` (`packages/core/src/components/desktop/fdShell.desktopIcon.tsx`): 일반 CSS `border-radius` 대신 연속 곡률 베지어 패스(`<svg><path>`)로 그린 진짜 스쿼클(Superellipse) 타일, 1줄 말줄임(`ellipsis`, `14px`), 마우스 오버 `title` 툴팁을 캡슐화
  - 창 타이틀바(`WindowWrapper`) 및 하단 태스크바 탭(`Taskbar`)에도 각 창의 앱 아이콘이 연동되어 표시되도록 확장 (`WindowInstance.icon`)
- **전역 웹폰트 (`Pretendard Variable` & `D2Coding`) CDN 연동**:
  - `@ferdy/ui`의 `fdStyle.libraries.css`에 `Pretendard Variable (Dynamic Subset)` 및 `D2Coding` 웹폰트 CDN을 `@layer libraries`로 로드
  - `--fd-font-sans`(`Pretendard Variable`), `--fd-font-mono`(`D2Coding`) 토큰 구성 및 태스크바 트레이/배지, `@ferdy/app-clock` 디지털 시계에 `D2Coding` 고정폭 폰트 적용

### Changed
- **`@ferdy/core` 컴포넌트 화면별 폴더 구조화, CSS Co-location 및 역할별 Prefix(`fdShell.*`, `fdStore.*`, `fdType.*`) 적용**:
  - `packages/core/src/components/` 하위를 `common/`, `desktop/`, `window/`, `taskbar/` 폴더로 분리
  - 기존 `packages/core/src/index.css`에 집중되어 있던 스타일을 각 컴포넌트와 1:1 Co-location 구성하고, `@ferdy/ui`의 네이밍 컨벤션과 일관되게 역할별 접두어 적용:
    - OS 셸 컴포넌트 & 스타일: `fdShell.appIcon.*`, `fdShell.desktop.*`, `fdShell.desktopIcon.*`, `fdShell.windowWrapper.*`, `fdShell.taskbar.*`
    - 상태 스토어 (`store/`): `fdStore.window.ts`
    - 타입 정의 (`types/`): `fdType.window.ts`
- **기존 유니코드 이모지 아이콘 제거**:
  - `@ferdy/assets` (`FERDY_ASSETS.icons`)의 윈도우 기본 컬러 이모지(`🧩`, `🕒`, `🚀`, `➕`)를 커스텀 SVG 경로 및 Lucide 아이콘 이름으로 전면 교체

---

## [0.1.3] - `@ferdy/ui` Design System, `@layer` Architecture & Icon System

### Added
- **`@ferdy/ui` 아이콘 컴포넌트 (`fd.Icon` / `FdIcon` / `Icon`) 및 `libraries` 레이어 추가**:
  - 오픈소스/서드파티 CSS 전용 `@layer libraries` (`fdStyle.libraries.css`) 계층을 `theme`과 `base` 사이에 추가하고 `lucide-static` 웹폰트(`@import 'lucide-static/font/lucide.css' layer(libraries);`)를 연동
  - `components/icon/fdCompo.icon.tsx` 및 `fdCompo.icon.css` 구현 (`name`, `size`: `'inherit' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number`, `spin`, `label` 지원)
  - Core 윈도우 컨트롤 버튼(`WindowWrapper.tsx`의 최소화/최대화·복원/닫기) 및 `@ferdy/app-sample` UI에 `<fd.Icon />` 적용

### Changed
- **`@ferdy/ui` CSS `@layer` 아키텍처 도입 및 `fdStyle.*` / `fdCompo.*` 구조화**:
  - `src/styles/index.css`에 `@layer reset, tokens, theme, libraries, base, layout, components, utilities;` 순서 정의
  - `index.css` 외 전역 스타일시트를 역할별 `fdStyle.<layer>.css` (`fdStyle.reset.css`, `fdStyle.tokens.css`, `fdStyle.theme.css`, `fdStyle.libraries.css`, `fdStyle.base.css`, `fdStyle.layout.css`, `fdStyle.components.css`, `fdStyle.utilities.css`)로 분리
  - 각 컴포넌트를 `src/components/<name>/` 폴더별로 분리하고 `fdCompo.<name>.tsx` 및 전용 스타일 `fdCompo.<name>.css`를 나란히 배치 (`fdStyle.components.css`에는 모든 컴포넌트 공통 규칙만 유지)
- **전반적인 컬러 테마 및 톤앤매너 리파인 (`fdStyle.theme.css`, `fdStyle.components.css`, `core/src/index.css`)**:
  - **Primary**: 빈티지한 오렌지 브라운(Terracotta) 계열(`--fd-primary*`, `--fd-accent*`) 적용
  - **Secondary**: 차분한 포레스트 그린(Forest Green) 계열(`--fd-secondary*`) 적용
  - **Surface & Text**: 오렌지 브라운 및 포레스트 그린과 조화를 이루는 웜 에스프레소/차콜 배경(`--fd-bg-*`)과 웜 크림/샌드 텍스트(`--fd-text-*`)로 데스크탑, 윈도우 프레임, 태스크바, 도메인 앱 전반의 색상 톤 통일
- **`@ferdy/ui` 접두어 및 컴포넌트 네임스페이스 통일**:
  - CSS 디자인 토큰 접두어를 `--ferdy-*`에서 `--fd-*`로 통일
  - 공통 클래스 및 레이아웃 헬퍼 접두어를 `.f-*`에서 `.fd-*`로 통일
  - 소문자 `fd` 컴포넌트 네임스페이스(`fd.Button`, `fd.Badge`, `fd.Card`, `fd.Icon`) 및 `Fd*` / 기본 별칭 동시 지원

---

## [0.1.2] - A-B-C-D-E Architecture, `@ferdy/ui` & `@ferdy/bridge`

### Added
- **A-B-C-D-E 워크스페이스 계층 구조 도입 (`packages/`)**:
  - **[A] `packages/assets` (`@ferdy/assets`)**: 공용 정적 파일(`public/assets/`) 및 심볼/경로 상수(`FERDY_ASSETS`) 패키지 신설
  - **[B] `packages/base/ui` (`@ferdy/ui`)**: OS 전역 CSS 디자인 토큰(`tokens.css`), Base 리셋(`base.css`), 공통 SolidJS UI 컴포넌트(`<Button>`, `<Badge>`, `<Card>`) 패키지 신설
  - **[B] `packages/base/bridge` (`@ferdy/bridge`)**: Core와 Domain Apps 간 `window.postMessage` 통신을 타입 안전하게 처리하는 Pub/Sub 브릿지(`ferdyBridge`) 패키지 신설
  - **[E] `packages/etc`**: 기타 실험적 모듈 및 확장을 위한 디렉토리 구성

### Changed
- **[C] `@ferdy/shell` → `@ferdy/core` (`packages/core`) 전환**:
  - `@ferdy/ui` 디자인 토큰 및 `@ferdy/bridge`, `@ferdy/assets` 연동
  - `vite.config.ts`의 `monorepoDomainsGatewayPlugin`이 `packages/domains/*`를 스캔하여 개발 서버 라우팅 및 프로덕션 빌드 시 `dist/apps/<app-name>/index.html`로 출력하도록 개선
- **[D] `packages/apps/*` → `packages/domains/*` 전환 및 리팩토링**:
  - `@ferdy/app-sample`, `@ferdy/app-clock`이 `@ferdy/ui`와 `@ferdy/bridge`를 사용하도록 리팩토링하여 중복 인라인 리셋 스타일 및 하드코딩된 `postMessage` 호출 제거

---

## [0.1.1] - Clock App & Documentation

### Added
- **`@ferdy/app-clock` (소형 시계 앱)**:
  - 실시간 디지털 시계(`HH:MM:SS`), `YYYY-MM-DD(DAY)` 날짜 표시 및 `24H`(기본) / `12H` 포맷 전환 기능을 갖춘 소형 앱 추가
  - 창 너비와 높이(`vw`, `vh`)에 비례하여 시간/날짜 폰트 크기가 반응형으로 확대되도록 구성
  - 데스크탑 초기 실행 시 샘플 앱 우측(`x: 780, y: 80`, 크기 `340x230`)에 나란히 배치 및 바탕화면 `Clock` 바로가기 아이콘 등록

### Fixed
- **앱 창(`iframe`) 기본 여백 및 스크롤바 제거**:
  - 각 하위 앱 `index.html`에 기본 `html, body, #root` 마진/패딩 리셋 스타일을 적용하여 불필요한 스크롤바 발생 방지
  - Shell `.os-window-body` 및 `.os-window-iframe` 레이아웃/배경색 보정

### Documentation & DX
- **정보 관리 체계 수립**:
  - 루트 [README.md](../../README.md) 및 패키지별 상세 `README.md` 작성
  - `docs/` 지식 베이스 신설 (`architecture.md`, `features.md`, `releases.md`)
  - AI 에이전트 협업을 위한 `AGENTS.md` 및 `.agents/` (규칙 및 신규 앱 생성 스킬) 구성

---

## [0.1.0] - Initial Prototype

### Added
- **Monorepo 기반 구축**:
  - npm workspaces 구성
  - SolidJS + TypeScript + Vite 6 기반 환경 설정
- **Web OS 코어 및 윈도우 매니저**:
  - 단일 서버(`:3000`) MPA 개발/빌드 파이프라인 구현
  - `windowStore` 기반 다중 창 상태 관리 (열기, 닫기, 포커스, 최소화, 최대화, 드래그 이동, 8방향 리사이징)
  - `Desktop`, `WindowWrapper`, `Taskbar` UI 컴포넌트 및 다크 글래스모피즘 스타일링 적용
  - `window.postMessage` 수신 브릿지 (`FERDY_APP_PING`, `FERDY_OPEN_WINDOW`)
- **`@ferdy/app-sample` (샘플 앱)**:
  - `iframe` 샌드박스 내에서 동작하는 격리된 SolidJS 샘플 앱 구현
