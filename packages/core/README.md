# @ferdy/core (`packages/core`)

**Ferdy Platter (FerdyOS)**의 **[C] Core** 계층 패키지로, 메인 OS 환경(Desktop, Taskbar, Window Manager, App Registry)을 담당합니다.  
또한 개발 환경과 프로덕션 빌드에서 `packages/domains/**` 하위 도메인 앱들과 `packages/assets/public` 정적 에셋을 하나로 묶어 서빙하는 **게이트웨이 호스트** 역할을 수행합니다.

---

## 주요 역할

1. **Desktop & Taskbar UI (`components/`)**:
   - **바탕화면 (`desktop/`)**: 뷰포트 크기에 맞춰 정사각형에 가깝게 균등 분할되는 반응형 바탕화면 바로가기 아이콘 그리드(`desktopStore` + `appStore.state.shortcuts`), 드래그 앤 드롭 배치 및 Ghost 격자 오버레이(`Ctrl+Wheel` 배율 조절)를 렌더링합니다.
   - **작업 표시줄 & 시작 메뉴 (`taskbar/`)**: 좌측 하단 `fdPlatter` 시작 버튼과 글래스모피즘 시작 메뉴 팝업(`StartMenu` — 앱 검색·`builtin` / `sample` / `work` 카테고리 필터·실행/새 창 열기·창 제어 퀵 액션), 열린 창 탭 목록, 우측 트레이 창 정렬 버튼(바둑판·계단식·모두 최소화/복원) 및 시계를 렌더링합니다.
2. **App Registry & Shortcut Service (`services/app/`)**:
   - `.meta.ts` 파일 규칙(한 파일당 한 종류의 메타데이터 관리)에 따라 설치된 도메인 앱 매니페스트(`fdCore.app.manifest.meta.ts`), 바탕화면 바로가기 목록(`fdCore.app.shortcuts.meta.ts`), 아이콘 컬러 톤 프리셋(`fdCore.app.tones.meta.ts`)을 분리하여 관리합니다.
   - `appStore.launchApp(appId, options)`, `appStore.launchAppInWindow(windowId, appId)` 및 `appStore.openShortcut(shortcut)`을 통해 매니페스트 기본값을 기반으로 쿼리 파라미터(`?instance=2`), 창 제목, 위치/크기를 오버라이드하거나 외부 웹 사이트(`appUrl`, `openMode: 'window' | 'new-tab'`)를 실행할 수 있습니다.
3. **Window Management Service (`services/window/` & `components/window/`)**:
   - 다중 창의 열기, 닫기, 최소화, 최대화/복원, Z-Index 포커스(및 바탕화면 클릭 시 포커스 해제), 타이틀바 드래그 이동, 8방향 리사이징(앱별 최소 창 크기 `minWidth`/`minHeight` 지원), 활성 창 단독 새로고침(`F5`, `Ctrl+R`, `Cmd+R`)을 관리합니다.
   - **창 스냅 (`WindowSnapGhost`) & 일괄 정렬**: 좌/우/상단 가장자리 드래그 시 Ghost 프리뷰와 좌/우 50% 분할 또는 최대화 스냅을 지원하며, `restoreRect` 기반 드래그 분리 복원 및 바둑판식(`tileWindows`)·계단식(`cascadeWindows`)·모두 최소화/복원(`toggleMinimizeAllWindows`)·모두 닫기(`closeAllWindows`) 액션을 제공합니다.
   - **세션 영속화 (`fdCore.window.service.ts`)**: `ferdy.window.session` `localStorage` 키를 통해 열린 창의 위치·크기·상태를 저장하고 새로고침 시 정규화 복원합니다.
   - **빈 창 런처 & 로딩 뷰 (`WindowEmptyView` & `WindowLoadingView`)**: `+ New Window` 클릭 시 빈 창(`openEmptyWindow`)을 열어 앱 선택 시 `replaceWindow`로 즉시 전환하며, 앱 로딩·리로드 중에는 테마 일체형 로딩 오버레이를 표시합니다.
4. **iframe Sandbox & Bridge (`@ferdy/bridge`, `services/bridge/`)**:
   - 각 창의 본문 영역에 개별 도메인 앱을 `<iframe sandbox="...">`로 격리 로드하고, `fdCore.bridge.service.ts`에서 `FERDY_APP_PING`, `FERDY_OPEN_WINDOW`, `FERDY_SET_WINDOW_LOADING`(발신 창 역추적 기반 로딩 오버레이 제어) 이벤트를 수신·처리합니다.
5. **Monorepo Domains Gateway (`vite.config.ts`, `plugins/monorepoDomainsGateway.ts`)**:
   - **Dev**: `/domains/<app-rel-path>/` 요청을 가로채어 `packages/domains/<app-rel-path>/index.html`을 실시간 변환 및 서빙합니다.
   - **Build**: `packages/domains/**` 디렉토리를 재귀 스캔하여 중첩된 도메인 앱까지 Rollup `input`에 멀티페이지 엔트리로 자동 등록합니다.
   - **멀티 프레임워크 플러그인 스코핑**: `vite-plugin-solid`(`exclude`로 React/Vue 도메인 앱 제외), `@vitejs/plugin-react`(`include`로 `packages/domains/work/task-react/**` 전담), `@vitejs/plugin-vue`(`.vue` SFC 전담)를 조합해 단일 서버·단일 빌드에서 SolidJS, React, Vue 앱을 충돌 없이 함께 처리합니다.
   - **FOUC 방지 & Assets**: 프리로드 다크 에스프레소 테마 스타일을 주입해 초기 로딩 깜빡임을 방지하고, `packages/assets/public`을 `publicDir`로 연결하여 모든 정적 에셋을 동일 오리진(`/assets/...`)에서 서빙합니다.

---

## 디렉토리 구조

```text
packages/core/
├── index.html                # Core 메인 HTML 엔트리
├── package.json              # @ferdy/core 패키지 매니페스트 및 스크립트
├── README.md                 # @ferdy/core 패키지 가이드
├── tsconfig.json             # TypeScript 설정 (@ferdy/tsconfig/base.json 확장 및 ~/ 별칭)
├── tsconfig.node.json        # Node/Vite 번들 설정용 TypeScript 설정 (@ferdy/tsconfig/node.json 확장)
├── vite.config.ts            # Vite 서버·빌드 설정 및 도메인 게이트웨이 플러그인 연동
├── plugins/
│   └── monorepoDomainsGateway.ts # 도메인 앱 게이트웨이 미들웨어 및 재귀 MPA 엔트리 스캔 플러그인
└── src/
    ├── index.tsx             # SolidJS 마운트 엔트리 (@ferdy/ui 로드)
    ├── index.css             # OS 쉘 루트(#root, .os-shell-root) 레이아웃 스타일
    ├── App.tsx               # 최상위 레이아웃 (Desktop + Taskbar) 및 @ferdy/bridge 이벤트 구독
    ├── components/
    │   ├── common/
    │   │   ├── fdShell.app.icon.tsx        # SVG 에셋 경로 및 Lucide 아이콘(<fd.Icon>) 하이브리드 렌더러
    │   │   └── fdShell.app.icon.css        # 공통 아이콘 이미지 스타일
    │   ├── desktop/
    │   │   ├── fdShell.desktop.tsx         # 바탕화면 바로가기 그리드 및 활성 창 레이어 렌더링
    │   │   ├── fdShell.desktop.css         # 바탕화면 배경 및 레이어 스타일
    │   │   ├── components/
    │   │   │   ├── fdShell.desktop.ghost.tsx   # Ghost 격자 오버레이 및 배율 배지 UI
    │   │   │   ├── fdShell.desktop.icon.tsx    # 바탕화면 앱 타일(Squircle) + 1줄 말줄임 라벨 + 툴팁 아이콘 버튼
    │   │   │   └── fdShell.desktop.icon.css    # 바탕화면 아이콘 타일 및 호버 스타일
    │   │   └── hooks/
    │   │       └── fdShell.desktop.hooks.ts    # 바탕화면 아이콘 드래그 및 뷰포트/Ctrl+Wheel 줌 훅
    │   ├── window/
    │   │   ├── fdShell.window.tsx          # 개별 창 프레임 (레이아웃, iframe 호스팅, 8방향 리사이즈 핸들)
    │   │   ├── fdShell.window.css          # 창 프레임, 타이틀바, 스냅 Ghost, 빈 창/로딩 뷰 스타일
    │   │   ├── components/
    │   │   │   ├── fdShell.window.empty.tsx    # 빈 창(+ New Window) 내장 앱 런처 뷰
    │   │   │   ├── fdShell.window.ghost.tsx    # 창 가장자리 스냅 Ghost 프리뷰 오버레이
    │   │   │   ├── fdShell.window.loading.tsx  # 창 iframe 로딩/리로드 오버레이 뷰
    │   │   │   └── fdShell.window.titlebar.tsx # 창 상단 타이틀바 및 컨트롤 버튼 UI
    │   │   └── hooks/
    │   │       └── fdShell.window.hooks.ts     # 창 드래그/리사이즈·스냅 및 iframe 로딩/새로고침 훅
    │   └── taskbar/
    │       ├── fdShell.taskbar.tsx         # 하단 작업 표시줄 (런처 버튼, 창 토글 탭, 트레이 액션, 시계)
    │       ├── fdShell.taskbar.css         # 작업 표시줄 및 트레이 스타일
    │       └── components/
    │           ├── fdShell.taskbar.start.tsx   # 시작 메뉴(StartMenu) 앱 검색·필터·실행·창 제어 팝업
    │           └── fdShell.taskbar.start.css   # 시작 메뉴 팝업 스타일
    ├── services/
    │   ├── app/
    │   │   ├── fdCore.app.manifest.meta.ts   # 설치된 도메인 앱 매니페스트 초기 메타데이터 (INITIAL_APP_MANIFESTS)
    │   │   ├── fdCore.app.shortcuts.meta.ts  # 바탕화면 바로가기 초기 메타데이터 (INITIAL_DESKTOP_SHORTCUTS)
    │   │   ├── fdCore.app.tones.meta.ts      # 아이콘 타일 컬러 톤 프리셋 초기 메타데이터 (INITIAL_APP_ICON_TONES)
    │   │   └── fdCore.app.store.ts           # 앱 레지스트리 조회/등록, 바로가기 해석 및 앱 실행 스토어
    │   ├── bridge/
    │   │   └── fdCore.bridge.service.ts      # Core 셸 @ferdy/bridge 전역 이벤트 구독 핸들러
    │   ├── desktop/
    │   │   └── fdCore.desktop.store.ts       # 바탕화면 반응형 그리드 분할 계산, 뷰포트 조회, 배율 및 Ghost 격자 상태 스토어
    │   └── window/
    │       ├── fdCore.window.service.ts      # 창 세션 localStorage 직렬화/복원 및 스냅·타일·캐스케이드 좌표 계산
    │       └── fdCore.window.store.ts        # SolidJS createStore 기반 활성 창 상태 및 액션 정의
    └── types/
        ├── fdCore.app.type.ts         # AppManifest, DesktopShortcut, LaunchAppOptions 타입 정의
        ├── fdCore.desktop.type.ts     # DesktopGridConfig, DesktopGridLayout, DesktopGridPlacement 타입 정의
        └── fdCore.window.type.ts      # WindowInstance, WindowSnapZone, CreateWindowPayload 타입 정의
```

---

## 스크립트

```bash
# 개발 서버 실행 (포트 3000)
npm run dev --workspace=@ferdy/core

# 타입 체크
npm run typecheck --workspace=@ferdy/core

# 프로덕션 빌드 (Core + 모든 하위 도메인 앱 포함)
npm run build --workspace=@ferdy/core
```
