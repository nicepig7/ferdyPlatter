# TODO & Ideas Scratchpad

다음 작업 세션에서 진행할 단기 **Action Items (TODO)**와 자유롭게 떠오르는 **아이디어(Backlog / Brainstorming)**를 가볍게 기록하고 관리하는 문서입니다.

> **참고**: 큰 단위의 공식 마일스톤과 완료된 기능 명세는 [docs/features.md](../features.md)에서 관리하며, 이곳의 항목이 구현 완료되면 `features.md` 및 [docs/releases.md](../releases.md)에 반영한 뒤 정리합니다.
> 주제별 상세 브레인스토밍 문서는 `docs/todo/todo.<topic>.md` 형태로 함께 관리합니다 (예: [todo.opfs.md](./todo.opfs.md)).

---

## 🎯 Next Up (다음 작업 후보)

가장 먼저 착수할 만한 단기 작업 목록입니다.

- [ ] **런타임 테마 스위처 (`dark` / `light`) 연동**
  - `@ferdy/ui`의 `fdStyle.theme.css`에 라이트 모드(또는 추가 빈티지 테마) 토큰 세트 정의
  - `@ferdy/core`에서 `ferdyBridge.broadcast('FERDY_THEME_CHANGE', { theme })` 발행 및 각 도메인 앱 수신 처리
- [ ] **창 상태 `localStorage` 세션 유지**
  - 새로고침 시에도 열려 있던 창들의 위치(`x`, `y`), 크기(`width`, `height`), 최소화/최대화 상태 복원

---

## 💡 Ideas & Brainstorming (자유 메모)

구체화되기 전의 아이디어나 실험해보고 싶은 기능들을 자유롭게 적어두는 공간입니다.

### 🎨 `@ferdy/ui` (디자인 시스템 & 컴포넌트)
- [ ] 추가 기본 컴포넌트 확장 후보:
  - `fd.Input` / `fd.Select` / `fd.Switch` (토글 스위치)
  - `fd.Tooltip` / `fd.Modal` / `fd.Tabs`
- [ ] 바탕화면 아이콘 및 태스크바 런처에도 `<fd.Icon>` 적용 확대

### 🖥️ `@ferdy/core` (Window Manager & Desktop UX)
- [ ] **Window Snapping (창 스냅)**: 창을 화면 좌/우/상단 가장자리로 드래그할 때 반쪽 분할 또는 최대화 가이드 프리뷰 표시
- [ ] **Start Menu (시작 메뉴)**: 좌측 하단 `fdPlatter` 버튼 클릭 시 설치된 도메인 앱 목록과 시스템 메뉴가 담긴 팝업 패널 오픈
- [ ] **바탕화면 컨텍스트 메뉴 (우클릭 메뉴)**: 새 창 열기, 창 정렬(바둑판식/계단식), 테마 변경 등 빠른 액션 제공
- [ ] **키보드 단축키 지원**: `Alt + Tab` 유사 창 전환 또는 활성 창 닫기/최소화 단축키

### 🧩 `packages/domains/*` (신규 도메인 앱 아이디어)
- [ ] **`@ferdy/app-monitor`**: `@ferdy/bridge`를 오가는 실시간 `postMessage` 이벤트 로그 및 현재 열린 창 상태 인스펙터
- [ ] **`@ferdy/app-settings`**: OS 배경화면, 컬러 테마, 시스템 환경설정을 제어하는 설정 앱

---

## 📝 Scratchpad (임시 메모)

- *(작업 중 떠오른 메모나 이슈, 참고할 링크 등을 자유롭게 아래에 추가하세요)*
