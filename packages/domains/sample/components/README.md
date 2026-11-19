# @ferdy/sample-components

FerdyOS `@ferdy/ui`의 **2층 하이브리드 UI 아키텍처**(1층 CSS Style Layer + 2층 Lit Web Components)를 한눈에 확인하고 인터랙티브하게 테스트할 수 있는 쇼케이스 도메인 앱입니다.

## 서빙 경로
- `/domains/sample/components/`

## 주요 기능
- **1층 Style Layer 탭 (`@ferdy/ui/styles.css`)**:
  - `.fd-btn` (variant / size / disabled)
  - `.fd-badge` (primary / secondary / neutral)
  - `.fd-card` (표준 카드 컨테이너)
  - `.fd-input` (default / ghost / size / disabled)
- **2층 Web Components 탭 (`@ferdy/ui/elements`)**:
  - `<fd-text-field>`: `clearable`, 좌/우 아이콘, `info`/`pass`/`fail` 상태, `instant` vs `lazy` Rule 검증(`validate()`, `resetValidation()`), 다중 필드 연속 `Tab` 포커스 이동 테스트
  - `<fd-select>`: 옵션 프리셋 전환, 키보드 탐색, 비활성화 옵션
  - `<fd-switch>`: `sm`/`md` 토글 스위치 및 접근성 `role="switch"`
  - `<fd-tabs>`: `pill`, `underline`, `segmented` 변형
  - **Event Inspector**: `fd-input`, `fd-change`, `fd-clear` 커스텀 이벤트 실시간 로그 확인
