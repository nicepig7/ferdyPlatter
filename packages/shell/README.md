# @ferdy/shell

**Ferdy Platter (FerdyOS)**의 메인 OS 환경(Desktop, Taskbar, Window Manager)을 담당하는 핵심 패키지입니다.  
또한 개발 환경과 프로덕션 빌드에서 `packages/apps/*` 하위 앱들을 하나로 묶어 서빙하는 **게이트웨이 호스트** 역할을 수행합니다.

---

## 주요 역할

1. **Desktop & Taskbar UI**: 바탕화면 바로가기 아이콘 그리드, 하단 작업 표시줄(앱 런처, 열린 창 목록, 상태 트레이 및 시계)을 렌더링합니다.
2. **Window Management**: 다중 창의 열기, 닫기, 최소화, 최대화/복원, Z-Index 포커스, 타이틀바 드래그 이동, 8방향 리사이징을 관리합니다.
3. **iframe Sandbox & Bridge**: 각 창의 본문 영역에 개별 앱을 `<iframe sandbox="...">`로 격리 로드하고, `window.postMessage` 이벤트를 수신하여 OS 동작(예: 새 창 열기 요청)을 처리합니다.
4. **Monorepo Apps Gateway (`vite.config.ts`)**:
   - **Dev**: `/apps/<app-name>/` 요청을 가로채어 `packages/apps/<app-name>/index.html`을 실시간 변환 및 서빙합니다.
   - **Build**: `packages/apps/*` 디렉토리를 스캔하여 Rollup `input`에 멀티페이지 엔트리로 자동 등록합니다.

---

## 디렉토리 구조

```text
packages/shell/
├── index.html                # Shell 메인 HTML 엔트리
├── vite.config.ts            # 단일 서버 앱 게이트웨이 미들웨어 및 MPA 빌드 설정
└── src/
    ├── index.tsx             # SolidJS 마운트 엔트리
    ├── App.tsx               # 최상위 레이아웃 (Desktop + Taskbar) 및 postMessage 리스너
    ├── components/
    │   ├── Desktop.tsx       # 바탕화면 아이콘 그리드 및 활성 창 레이어 렌더링
    │   ├── WindowWrapper.tsx # 개별 창 프레임 (타이틀바 드래그, 8방향 리사이즈, iframe 보호막)
    │   └── Taskbar.tsx       # 하단 작업 표시줄 (런처 버튼, 창 토글 탭, 시계)
    ├── store/
    │   └── windowStore.ts    # SolidJS createStore 기반 창 상태 및 액션 정의
    ├── types/
    │   └── window.ts         # WindowInstance, CreateWindowPayload 타입 정의
    └── styles/
        └── global.css        # OS 테마 및 윈도우/태스크바 레이아웃 스타일
```

---

## 핵심 구현 포인트

### 1. Fine-grained Window Store (`src/store/windowStore.ts`)
- `createStore`와 `produce`를 사용하여 여러 개의 창이 열려 있어도 드래그/리사이즈 중인 해당 창의 `transform`과 `width`/`height` 스타일만 정밀하게 갱신됩니다.
- 최소 창 크기 제약(`MIN_WIDTH = 320`, `MIN_HEIGHT = 220`)과 활성 창 닫기/최소화 시 차상위 `zIndex` 창으로 포커스를 자동 이관하는 로직이 포함되어 있습니다.

### 2. iframe 이벤트 간섭 방지 (`src/components/WindowWrapper.tsx`)
- 창을 드래그하거나 리사이즈하는 도중 마우스 포인터가 `iframe` 영역 위로 넘어가면 포인터 이벤트가 끊기는 현상을 막기 위해, 조작 중(`isInteracting()`)이거나 비활성 창(`!isFocused`)일 때 투명 보호막(`.os-window-iframe-shield`)을 렌더링합니다.

---

## 스크립트

루트에서 실행하거나 본 패키지 경로에서 실행할 수 있습니다.

```bash
# 개발 서버 실행 (포트 3000)
npm run dev --workspace=@ferdy/shell

# 타입 체크
npm run typecheck --workspace=@ferdy/shell

# 프로덕션 빌드 (Shell + 모든 하위 앱 포함)
npm run build --workspace=@ferdy/shell
```

