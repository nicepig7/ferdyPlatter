# TODO & Ideas Scratchpad

다음 작업 세션에서 진행할 단기 **Action Items (TODO)**와 자유롭게 떠오르는 **아이디어(Backlog / Brainstorming)**를 가볍게 기록하고 관리하는 문서입니다.

> **참고**: 큰 단위의 공식 마일스톤과 완료된 기능 명세는 [docs/features.md](../features.md)에서 관리하며, 이곳의 항목이 구현 완료되면 `features.md` 및 [docs/releases/releases.md](../releases/releases.md)에 반영한 뒤 정리합니다.
> 주제별 상세 브레인스토밍 문서는 `docs/todo/todo.<topic>.md` 형태로 함께 관리합니다 (예: [todo.opfs.md](./todo.opfs.md)).

---

## 🎯 Next Up (다음 작업 후보)

가장 먼저 착수할 만한 단기 작업 목록입니다.

### 🪟 Window & Bridge 확장 후보군
- [ ] **App ↔ Window 양방향 제어 확장 (`@ferdy/bridge` & `AppManifest`)**
  - 도메인 앱이 자신의 창 제목을 동적으로 변경(`FERDY_SET_WINDOW_TITLE`, 예: `@ferdy/builtin-notes`에서 선택된 메모 제목 반영)하거나 창 닫기·최소화를 요청하는 브릿지 이벤트 추가
  - `AppManifest`에 단일 인스턴스 정책(`singleton?: boolean`)이나 창 크기 조절 허용 여부(`resizable?: boolean`) 등 앱별 창 정책 옵션 확장
- [ ] **`@ferdy/builtin-monitor` (작업 관리자 / 브릿지 & 윈도우 인스펙터 앱)**
  - 현재 열린 창 목록(`windowId`, 크기, 좌표, Z-Index, 포커스 전환/강제 종료)과 `@ferdy/bridge` 실시간 `postMessage` 이벤트 로그를 모니터링하는 내장 유틸리티 앱

### 🎨 테마 시스템 후보군
- [ ] **런타임 테마 스위처 (`dark` / `light`) 연동**
  - `@ferdy/ui`의 `fdStyle.theme.css`에 라이트 모드(또는 추가 빈티지 테마) 토큰 세트 정의
  - `@ferdy/core`에서 `ferdyBridge.broadcast('FERDY_THEME_CHANGE', { theme })` 발행 및 각 도메인 앱 수신 처리

---

## 💡 Ideas & Brainstorming (자유 메모)

구체화되기 전의 아이디어나 실험해보고 싶은 기능들을 자유롭게 적어두는 공간입니다.

### 🎨 `@ferdy/ui` (디자인 시스템 & 컴포넌트)
- [ ] 추가 기본 컴포넌트 확장 후보:
  - `fd.Select` / `fd.Switch` (토글 스위치) / `fd.Textarea`
  - `fd.Tooltip` / `fd.Modal` / `fd.Tabs`

### 🖥️ `@ferdy/core` (Window Manager & Desktop UX)
- [ ] **바탕화면 위젯(Widget) 지원**: 그리드 모델(`colSpan` × `rowSpan`) 기반 다중 셀 위젯 배치 (예: 2×1 시계, 2×2 메모/캘린더 요약)
- [ ] **바탕화면 컨텍스트 메뉴 (우클릭 메뉴)**: 새 창 열기, 창 정렬(바둑판식/계단식), 테마 변경 등 빠른 액션 제공
- [ ] **키보드 단축키 지원**: `Alt + Tab` 유사 창 전환 또는 활성 창 닫기/최소화 단축키

### 🧩 `packages/domains/*` (신규 도메인 앱 아이디어)
- [ ] **`@ferdy/builtin-settings`**: OS 배경화면, 컬러 테마, 시스템 환경설정을 제어하는 설정 앱

---

## 📝 Scratchpad (임시 메모)

- *(작업 중 떠오른 메모나 이슈, 참고할 링크 등을 자유롭게 아래에 추가하세요)*
