# Release Notes

**Ferdy Platter (FerdyOS)**의 버전별 주요 변경 사항과 이력을 기록합니다.

---

## [0.1.5] - App Manifest Registry (`services/app/`) & `.meta.ts` Convention

### Added
- **App/Window 서비스 계층(`services/`) 분리 및 `.meta.ts` 파일 규칙 도입 (`@ferdy/core`)**:
  - `packages/core/src` 하위를 `components/`(UI 뷰), `services/`(도메인별 상태·메타데이터), `types/`(타입 정의) 3계층으로 개편
  - 메타 정보를 저장하는 파일은 접미사로 `.meta.ts`를 붙이고 **한 파일에 한 종류의 데이터만 관리**하도록 규칙 수립:
    - `packages/core/src/services/app/fdRegist.apps.manifest.meta.ts`: 초기 등록된 도메인 앱 매니페스트 목록(`INITIAL_APP_MANIFESTS`: `app-sample`, `app-clock`, `app-hello`) 단독 관리
    - `packages/core/src/services/app/fdRegist.apps.shortcuts.meta.ts`: 바탕화면 기본 바로가기 목록(`INITIAL_DESKTOP_SHORTCUTS`) 단독 관리
  - `packages/core/src/services/app/fdStore.app.ts`: 앱 조회(`getApp`, `getAppList`), 동적 등록(`registerApp`), 바로가기 메타정보 병합 해석(`resolveShortcut`), `appId` 기반 창 실행(`launchApp`) 및 바로가기 실행(`openShortcut`) 액션 구현
  - `packages/core/src/services/window/fdStore.window.ts`: 기존 창 관리 스토어를 `services/window/` 하위로 이동
  - `packages/core/src/types/fdType.app.ts`: `AppManifest`, `DesktopShortcut`, `LaunchAppOptions` 타입 정의 추가
- **`@ferdy/app-hello` 도메인 앱 등록**:
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
