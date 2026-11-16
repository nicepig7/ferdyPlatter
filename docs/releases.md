# Release Notes

**Ferdy Platter (FerdyOS)**의 버전별 주요 변경 사항과 이력을 기록합니다.

---

## [0.1.3] - `@ferdy/ui` Design System & Prefix Standardization (In Progress)

### Changed
- **`@ferdy/ui` 접두어 및 컴포넌트 네임스페이스 통일**:
  - CSS 디자인 토큰 접두어를 `--ferdy-*`에서 `--fd-*`로 통일 (`tokens.css`)
  - 공통 클래스 및 레이아웃 헬퍼 접두어를 `.f-*`에서 `.fd-*`로 통일 (`base.css`)
  - 소문자 `fd` 컴포넌트 네임스페이스(`fd.Button`, `fd.Badge`, `fd.Card`) 및 `FdButton` / `Button` 등 별칭 동시 지원

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
  - 루트 [README.md](../README.md) 및 패키지별 상세 `README.md` 작성
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
