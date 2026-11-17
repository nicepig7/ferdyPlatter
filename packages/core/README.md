# @ferdy/core (`packages/core`)

**Ferdy Platter (FerdyOS)**의 **[C] Core** 계층 패키지로, 메인 OS 환경(Desktop, Taskbar, Window Manager, App Registry)을 담당합니다.  
또한 개발 환경과 프로덕션 빌드에서 `packages/domains/*` 하위 도메인 앱들과 `packages/assets/public` 정적 에셋을 하나로 묶어 서빙하는 **게이트웨이 호스트** 역할을 수행합니다.

---

## 주요 역할

1. **Desktop & Taskbar UI (`components/`)**: 뷰포트 크기에 맞춰 정사각형에 가깝게 균등 분할되는 반응형 바탕화면 바로가기 아이콘 그리드(`desktopStore` + `appStore.state.shortcuts`), Ghost 격자 오버레이(`Ctrl+Wheel` 배율 조절), 하단 작업 표시줄(앱 런처, 열린 창 목록, 상태 트레이 및 시계)을 렌더링합니다.
2. **App Registry & Shortcut Service (`services/app/`)**:
   - `.meta.ts` 파일 규칙(한 파일당 한 종류의 메타데이터 관리)에 따라 설치된 도메인 앱의 고유 메타정보(`fdRegist.apps.manifest.meta.ts`)와 바탕화면 바로가기 목록(`fdRegist.apps.shortcuts.meta.ts`)을 분리하여 관리합니다.
   - `appStore.launchApp(appId, options)` 및 `appStore.openShortcut(shortcut)`을 통해 매니페스트 기본값을 기반으로 쿼리 파라미터(`?instance=2`), 창 제목, 위치/크기를 오버라이드하거나 외부 웹 사이트(`appUrl`, `openMode: 'window' | 'new-tab'`)를 바로가기로 실행할 수 있습니다.
3. **Window Management Service (`services/window/`)**: 다중 창의 열기, 닫기, 최소화, 최대화/복원, Z-Index 포커스(및 바탕화면 클릭 시 포커스 해제), 타이틀바 드래그 이동, 8방향 리사이징(앱별 최소 창 크기 `minWidth`/`minHeight` 지원), 활성 창 단독 새로고침(`F5`, `Ctrl+R`, `Cmd+R`)을 관리합니다.
4. **iframe Sandbox & Bridge (`@ferdy/bridge`)**: 각 창의 본문 영역에 개별 도메인 앱을 `<iframe sandbox="...">`로 격리 로드하고, `@ferdy/bridge`를 통해 이벤트를 수신·처리합니다.
5. **Monorepo Domains Gateway (`vite.config.ts`)**:
   - **Dev**: `/apps/<app-name>/` 요청을 가로채어 `packages/domains/<app-name>/index.html`을 실시간 변환 및 서빙합니다.
   - **Build**: `packages/domains/*` 디렉토리를 스캔하여 Rollup `input`에 멀티페이지 엔트리로 자동 등록합니다.
   - **Assets**: `packages/assets/public`을 `publicDir`로 연결하여 모든 정적 에셋을 동일 오리진(`/assets/...`)에서 서빙합니다.

---

## 디렉토리 구조

```text
packages/core/
├── index.html                # Core 메인 HTML 엔트리
├── vite.config.ts            # 단일 서버 도메인 앱 게이트웨이 미들웨어 및 MPA 빌드 설정
└── src/
    ├── index.tsx             # SolidJS 마운트 엔트리 (@ferdy/ui 로드)
    ├── index.css             # OS 쉘 루트(#root, .os-shell-root) 레이아웃 스타일
    ├── App.tsx               # 최상위 레이아웃 (Desktop + Taskbar) 및 @ferdy/bridge 이벤트 구독
    ├── components/
    │   ├── common/
    │   │   ├── fdShell.appIcon.tsx         # SVG 에셋 경로 및 Lucide 아이콘(<fd.Icon>) 하이브리드 렌더러
    │   │   └── fdShell.appIcon.css         # 공통 아이콘 이미지 스타일
    │   ├── desktop/
    │   │   ├── fdShell.desktop.tsx         # 바탕화면 바로가기 그리드 및 활성 창 레이어 렌더링
    │   │   ├── fdShell.desktop.css         # 바탕화면 배경 및 레이어 스타일
    │   │   ├── fdShell.desktopIcon.tsx     # 바탕화면 앱 타일(Squircle) + 1줄 말줄임 라벨 + 툴팁 아이콘 버튼
    │   │   └── fdShell.desktopIcon.css     # 바탕화면 아이콘 타일 및 호버 스타일
    │   ├── window/
    │   │   ├── fdShell.windowWrapper.tsx   # 개별 창 프레임 (타이틀바 드래그, 8방향 리사이즈, iframe 보호막)
    │   │   └── fdShell.windowWrapper.css   # 창 프레임, 타이틀바, 리사이즈 핸들 스타일
    │   └── taskbar/
    │       ├── fdShell.taskbar.tsx         # 하단 작업 표시줄 (런처 버튼, 창 토글 탭, 시계)
    │       └── fdShell.taskbar.css         # 작업 표시줄 및 트레이 스타일
    ├── services/
    │   ├── app/
    │   │   ├── fdRegist.apps.manifest.meta.ts   # 설치된 도메인 앱 매니페스트 초기 메타데이터 (INITIAL_APP_MANIFESTS)
    │   │   ├── fdRegist.apps.shortcuts.meta.ts  # 바탕화면 바로가기 초기 메타데이터 (INITIAL_DESKTOP_SHORTCUTS)
    │   │   ├── fdRegist.apps.tones.meta.ts      # 아이콘 타일 컬러 톤 프리셋 초기 메타데이터 (INITIAL_APP_ICON_TONES)
    │   │   └── fdStore.app.ts                   # 앱 레지스트리 조회/등록, 바로가기 해석 및 앱 실행 스토어
    │   ├── desktop/
    │   │   └── fdStore.desktop.ts               # 바탕화면 반응형 그리드 분할 계산, Ctrl+Wheel 배율 및 Ghost 격자 상태 스토어
    │   └── window/
    │       └── fdStore.window.ts                # SolidJS createStore 기반 활성 창 상태 및 액션 정의
    └── types/
        ├── fdType.app.ts         # AppManifest, DesktopShortcut, LaunchAppOptions 타입 정의
        ├── fdType.desktop.ts     # DesktopGridConfig, DesktopGridLayout, DesktopGridPlacement 타입 정의
        └── fdType.window.ts      # WindowInstance, CreateWindowPayload 타입 정의
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
