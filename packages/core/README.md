# @ferdy/core (`packages/core`)

**Ferdy Platter (FerdyOS)**의 **[C] Core** 계층 패키지로, 메인 OS 환경(Desktop, Taskbar, Window Manager)을 담당합니다.  
또한 개발 환경과 프로덕션 빌드에서 `packages/domains/*` 하위 도메인 앱들과 `packages/assets/public` 정적 에셋을 하나로 묶어 서빙하는 **게이트웨이 호스트** 역할을 수행합니다.

---

## 주요 역할

1. **Desktop & Taskbar UI**: 바탕화면 바로가기 아이콘 그리드, 하단 작업 표시줄(앱 런처, 열린 창 목록, 상태 트레이 및 시계)을 렌더링합니다.
2. **Window Management**: 다중 창의 열기, 닫기, 최소화, 최대화/복원, Z-Index 포커스, 타이틀바 드래그 이동, 8방향 리사이징을 관리합니다.
3. **iframe Sandbox & Bridge (`@ferdy/bridge`)**: 각 창의 본문 영역에 개별 도메인 앱을 `<iframe sandbox="...">`로 격리 로드하고, `@ferdy/bridge`를 통해 이벤트를 수신·처리합니다.
4. **Monorepo Domains Gateway (`vite.config.ts`)**:
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
    ├── index.css             # OS 데스크탑, 윈도우 프레임, 태스크바 레이아웃 스타일 (@ferdy/ui 토큰 활용)
    ├── App.tsx               # 최상위 레이아웃 (Desktop + Taskbar) 및 @ferdy/bridge 이벤트 구독
    ├── components/
    │   ├── Desktop.tsx       # 바탕화면 아이콘 그리드 및 활성 창 레이어 렌더링
    │   ├── WindowWrapper.tsx # 개별 창 프레임 (타이틀바 드래그, 8방향 리사이즈, iframe 보호막)
    │   └── Taskbar.tsx       # 하단 작업 표시줄 (런처 버튼, 창 토글 탭, 시계)
    ├── store/
    │   └── windowStore.ts    # SolidJS createStore 기반 창 상태 및 액션 정의
    └── types/
        └── window.ts         # WindowInstance, CreateWindowPayload 타입 정의
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
