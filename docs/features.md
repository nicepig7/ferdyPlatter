# Features & Roadmap

**Ferdy Platter (FerdyOS)**의 현재 구현된 기능 명세와 앞으로의 발전 방향(Roadmap)을 관리하는 문서입니다.

---

## 1. 구현 완료된 기능 (Current Features)

### 🏗️ A-B-C-D-E Monorepo Foundation
- [x] **[A] `@ferdy/assets` (`packages/assets`)**: 공용 정적 에셋 디렉토리(`public/assets/`) 및 심볼/경로 상수(`FERDY_ASSETS`) 중앙 관리
- [x] **[B] `@ferdy/ui` (`packages/base/ui`)**:
  - OS 전역 시맨틱 CSS 디자인 토큰(`--fd-*`), 웹폰트(`Pretendard Variable` & `D2Coding`), Base Reset 스타일 통합
  - 공통 SolidJS UI 컴포넌트(`<fd.Button>` / `<FdButton>` / `<Button>`, `<fd.Badge>` / `<FdBadge>` / `<Badge>`, `<fd.Card>` / `<FdCard>` / `<Card>`, `<fd.Icon>` / `<FdIcon>` / `<Icon>`) 및 도메인 앱 레이아웃 헬퍼(`.fd-app-shell`, `.fd-app-header`, `.fd-app-title`) 제공
- [x] **[B] `@ferdy/bridge` (`packages/base/bridge`)**:
  - `FerdyEventMap` 기반 타입 안전 `postMessage` 프로토콜 정의
  - `ferdyBridge.emit`, `ferdyBridge.on`, `ferdyBridge.broadcast`, `ferdyBridge.ping`, `ferdyBridge.openWindow` Pub/Sub API 제공
- [x] **[C] `@ferdy/core` (`packages/core`)**: 단일 Vite 서버(`:3000`) 기반 도메인 앱 온디맨드 라우팅(`/apps/<app-name>/`) 및 프로덕션 MPA 가상 엔트리 빌드 자동화
- [x] **[E] `packages/etc`**: 실험적 모듈 및 확장 유틸리티를 위한 예비 계층 구성

### 🖥️ Desktop, Taskbar, App Registry & Window Manager (`@ferdy/core`)
- [x] **앱 매니페스트 레지스트리 및 바로가기 분리 (`services/app/fdRegist.apps.*.meta.ts`, `appStore`)**:
  - `.meta.ts` 단일 데이터 파일 규칙에 따라 설치된 도메인 앱 고유 메타정보(`fdRegist.apps.manifest.meta.ts`)와 바탕화면 바로가기 목록(`fdRegist.apps.shortcuts.meta.ts`)을 분리하여 중앙 관리
  - `appId` 참조 기반 실행(`appStore.launchApp`) 및 인스턴스 파라미터(`queryParams`), 제목, 아이콘, 창 좌표/크기 오버라이드 지원
- [x] **바탕화면 바로가기 그리드 & SVG 스쿼클(Superellipse) 아이콘 타일 (`DesktopIcon`)**:
  - 연속 곡률 SVG 스쿼클 타일 + 하이브리드 아이콘(`AppIcon`: 커스텀 SVG 및 Lucide 아이콘 자동 분기)
  - 1줄 말줄임(`ellipsis`) 라벨 및 마우스 오버 전체 이름 툴팁 지원
- [x] **태스크바 런처 버튼 (`FerdyOS`)**: 빠른 새 샘플 앱 인스턴스 실행
- [x] **태스크바 활성 창 탭 목록**:
  - 현재 열린 모든 창의 앱 아이콘, 제목, Z-Index 상태 실시간 표시
  - 탭 클릭 시 상태에 따라 **포커스 전환 / 최소화 / 복원** 스마트 토글
- [x] **창 생명주기 및 Z-Index 포커스 제어**: 열기, 닫기, 최소화, 최대화/복원, 차상위 창 포커스 자동 이관, 바탕화면 클릭 시 창 포커스 해제(`blurAllWindows`)
- [x] **활성 창 단독 새로고침 (`F5`, `Ctrl+R`, `Cmd+R`)**: 창 내부(`iframe`) 또는 포커스된 창에서 새로고침 단축키 입력 시 브라우저 전체 새로고침을 방지하고 해당 창만 리로드 (포커스된 창이 없을 때는 기존 브라우저 새로고침 동작 유지)
- [x] **창 드래그 이동 및 8방향 리사이징**: `translate3d` 기반 이동, 8방향 크기 조절(`320x220` 최소 크기 제한), `iframe` 포인터 보호막(`.os-window-iframe-shield`)

### 🧩 Domain Apps (`packages/domains/*`)
- [x] **샘플 앱 (`@ferdy/app-sample`)**: `@ferdy/ui` 컴포넌트(`Button`, `Badge`)와 `@ferdy/bridge` 통신을 활용한 표준 레퍼런스 앱
- [x] **시계 앱 (`@ferdy/app-clock`)**: `@ferdy/ui` 토큰/버튼 기반의 실시간 디지털 시계 및 24H/12H 포맷 토글 위젯 앱
- [x] **헬로 월드 앱 (`@ferdy/app-hello`)**: 최소 구성(Minimal) 도메인 앱 구조 및 스타일시트 연동 검증 앱

---

## 2. 향후 로드맵 (Planned / Ideas)

### Phase 1: 정보 관리 및 아키텍처 기반 고도화
- [x] 프로젝트 문서 체계(`README.md`, `docs/`, `AGENTS.md`, `.agents/`) 수립
- [x] A-B-C-D-E 폴더 구조 개편 및 `@ferdy/ui`, `@ferdy/bridge`, `@ferdy/assets` 분리 완료
- [x] 앱 메타데이터 레지스트리 구조화 (설치된 앱 매니페스트와 바탕화면 바로가기 분리 관리)
- [ ] 런타임 테마 스위처 (`FERDY_THEME_CHANGE` 브로드캐스트를 통한 다크/라이트 모드 실시간 전환)

### Phase 2: UX 및 Window Manager 고도화
- [ ] 창 스냅(Window Snapping) — 화면 가장자리로 드래그 시 좌/우 분할 또는 전체화면 미리보기
- [ ] 시작 메뉴(Start Menu) 팝업 패널 및 설치된 도메인 앱 목록 검색/실행
- [ ] 창 위치/크기/열린 상태 `localStorage` 세션 저장 및 복원

### Phase 3: 실용적인 도메인 앱(`packages/domains/*`) 추가
- [ ] 메모장 / 마크다운 노트 앱 (`app-notes`)
- [ ] 시스템 모니터 / 브릿지 이벤트 로그 뷰어 앱 (`app-monitor`)
- [ ] 설정 앱 (`app-settings` — 배경화면, 테마 변경 등)
