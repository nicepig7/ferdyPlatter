# Features & Roadmap

**Ferdy Platter (FerdyOS)**의 현재 구현된 기능 명세와 앞으로의 발전 방향(Roadmap)을 관리하는 문서입니다.

---

## 1. 구현 완료된 기능 (Current Features)

### 🖥️ Desktop & Taskbar (`@ferdy/shell`)
- [x] **바탕화면 바로가기 그리드**: 아이콘 클릭/더블클릭을 통한 앱 실행 및 새 창 스폰 기능
- [x] **태스크바 런처 버튼 (`FerdyOS`)**: 빠른 새 샘플 앱 인스턴스 실행
- [x] **태스크바 활성 창 탭 목록**:
  - 현재 열린 모든 창의 제목과 Z-Index 상태 실시간 표시
  - 탭 클릭 시 상태에 따라 **포커스 전환 / 최소화 / 복원** 스마트 토글
- [x] **시스템 트레이**: 현재 열린 창 개수 카운터 및 실시간 디지털 시계 표시

### 🪟 Window Manager (`@ferdy/shell`)
- [x] **창 생명주기 제어**: 열기(`openWindow`), 닫기(`closeWindow`), 최소화(`minimizeWindow`), 최대화 및 복원(`toggleMaximizeWindow`)
- [x] **다중 창 Z-Index 스태킹 및 자동 포커스 이관**:
  - 창 클릭 시 최상단(`topZIndex + 1`)으로 자동 승격
  - 활성 창을 닫거나 최소화할 때 남아 있는 가시 창 중 가장 위에 있는 창으로 포커스 자동 이동
- [x] **창 드래그 이동**: 타이틀바 포인터 드래그를 통한 실시간 이동 (`translate3d` 기반) 및 타이틀바 더블클릭 최대화 토글
- [x] **8방향 창 리사이징**: 상/하/좌/우 및 4개 모서리(`n`, `s`, `e`, `w`, `ne`, `nw`, `se`, `sw`) 크기 조절 및 최소 크기(`320x220`) 제한
- [x] **iframe 포인터 보호막 (Shield)**: 드래그/리사이즈 중이거나 비활성 창일 때 `iframe`으로 마우스 이벤트가 빠지는 현상 방지

### 🧩 Monorepo & App Ecosystem
- [x] **단일 서버 MPA 게이트웨이**: Vite 커스텀 플러그인을 통한 `/apps/<app-name>/` 온디맨드 라우팅 및 멀티페이지 빌드 자동화
- [x] **Shell ↔ App `postMessage` 브릿지**: `FERDY_APP_PING`, `FERDY_OPEN_WINDOW` 메시지 통신 구현
- [x] **샘플 앱 (`@ferdy/app-sample`)**: 독립 상태 카운터 및 Shell 메시지 발신 테스트 UI
- [x] **시계 앱 (`@ferdy/app-clock`)**: 샘플 앱 옆에 배치되는 컴팩트 실시간 디지털 시계 및 12H/24H 포맷 토글 위젯 앱

---

## 2. 향후 로드맵 (Planned / Ideas)

### Phase 1: 정보 관리 및 개발 환경 고도화 (진행 중)
- [x] 프로젝트 문서 체계(`README.md`, `docs/`, `AGENTS.md`, `.agents/`) 수립
- [ ] 공통 타입/브릿지 SDK 패키지 분리 검토 (예: `@ferdy/sdk`로 `postMessage` 타입 안전성 확보)
- [ ] 앱 메타데이터 레지스트리 구조화 (바탕화면 아이콘, 기본 창 크기 등을 설정 파일로 관리)

### Phase 2: UX 및 Window Manager 고도화
- [ ] 창 스냅(Window Snapping) — 화면 가장자리로 드래그 시 좌/우 분할 또는 전체화면 미리보기
- [ ] 시작 메뉴(Start Menu) 팝업 패널 및 설치된 앱 목록 검색/실행
- [ ] 창 위치/크기/열린 상태 `localStorage` 세션 저장 및 복원

### Phase 3: 실용적인 빌트인 앱 추가
- [ ] 메모장 / 마크다운 노트 앱 (`app-notes`)
- [ ] 시스템 모니터 / 메시지 로그 뷰어 앱 (`app-monitor`)
- [ ] 설정 앱 (`app-settings` — 배경화면, 테마 변경 등)

