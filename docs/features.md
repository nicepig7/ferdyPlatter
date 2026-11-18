# Features & Roadmap

**Ferdy Platter (FerdyOS)**의 현재 구현된 기능 명세와 향후 발전 방향(Roadmap)을 관리하는 문서입니다.

> **문서 역할 안내**
> - 모노레포 계층, MPA 게이트웨이, UI/Bridge 아키텍처 상세: [architecture.md](./architecture.md)
> - 버전별 변경 이력: [releases.md](./releases/releases.md)
> - 단기 작업 목록 및 상세 아이디어 백로그: [todo.md](./todo/todo.md)

---

## 1. OS Shell (`@ferdy/core`)

### 앱 레지스트리 및 바로가기
- **메타데이터 분리 관리 (`.meta.ts`)**: 설치된 앱 매니페스트(`manifest` — `BUILTIN_APP_MANIFESTS` / `SAMPLE_APP_MANIFESTS` 카테고리 구분), 바탕화면 바로가기(`shortcuts`), 아이콘 컬러 톤 프리셋(`tones`)을 개별 파일로 분리해 중앙 관리
- **앱 실행 및 인스턴스 오버라이드**: `appId` 참조 기반 실행과 바로가기별 제목, 아이콘, 컬러 톤, 쿼리 파라미터(`queryParams`), 창 좌표·크기 오버라이드 지원
- **외부 웹 사이트 바로가기**: `http(s)://` 외부 URL을 OS 내부 창(`openMode: 'window'`) 또는 브라우저 새 탭(`openMode: 'new-tab'`)으로 실행하며, 외부 창 타이틀바에 '새 탭에서 열기' 버튼과 Cross-Origin 안전 리로드 제공

### 바탕화면 그리드 & 아이콘
- **반응형 균등 그리드**: 데스크탑 영역 크기에 맞춰 정사각형에 가까운 `cols × rows` 그리드를 자동 계산하고, 셀 크기에 비례해 아이콘 타일·글리프·라벨을 스케일링
- **그리드 배율 조절 (`Ctrl + Wheel`)**: 짧은 변 기준 셀 개수(`3 ~ 14`, `localStorage` 저장)를 1칸씩 실시간 증감하며, 조절 중 Ghost 격자 오버레이와 배율 배지 표시
- **드래그 앤 드롭 배치**: 포인터 드래그 시 Ghost 격자 및 드롭 대상 셀을 하이라이트하고, 드롭 시 빈 셀 이동 또는 기존 아이콘과 위치 교환(`localStorage` 저장)
- **스쿼클 타일 & 하이브리드 아이콘**: 연속 곡률 SVG 스쿼클 타일에 8종 컬러 톤 프리셋(`neutral`, `primary`, `secondary`, `blue`, `amber`, `rose`, `violet`, `teal`) 적용, 커스텀 SVG·Lucide 아이콘 자동 분기, 외부 링크 배지 및 1줄 말줄임·전체 이름 툴팁 지원

### 태스크바
- **런처 버튼 (`fdPlatter`)**: `ferdy.svg` 브랜드 로고 적용 및 새 샘플 앱 인스턴스 빠른 실행
- **활성 창 탭 목록**: 열린 모든 창의 아이콘·제목·Z-Index·상태를 실시간 표시하고, 탭 클릭 시 **포커스 전환 / 최소화 / 복원** 스마트 토글
- **시스템 트레이**: 현재 열린 창 개수 및 실시간 시계 표시

### 윈도우 매니저
- **창 생명주기 및 포커스 제어**: 창 열기, 닫기, 최소화, 최대화/복원, Z-Index 순차 정렬 및 차상위 창 포커스 자동 이관, 바탕화면 클릭 시 전체 포커스 해제
- **비활성 `iframe` 첫 클릭 포커스**: 포커스되지 않은 Same-origin 도메인 앱 창 내부를 클릭하면 즉시 해당 창으로 포커스 전환
- **창 이동 및 8방향 리사이징**: 드래그 이동 및 8방향 크기 조절(OS 기본 최소 크기 `320×220` 및 앱 매니페스트별 `minWidth`/`minHeight` 지정 지원), 드래그 중 `iframe` 포인터 간섭 방지
- **활성 창 단독 새로고침 (`F5`, `Ctrl+R`, `Cmd+R`)**: 포커스된 창에서 새로고침 단축키 입력 시 브라우저 전체 리로드를 막고 해당 창 `iframe`만 리로드 (포커스된 창이 없을 때는 기본 브라우저 새로고침 유지)

---

## 2. Domain Apps (`packages/domains/**`)

모든 도메인 앱은 `<iframe sandbox>` 내부에서 역할별 카테고리(`builtin/`, `sample/`)로 분리되어 독립 실행되며, `@ferdy/ui`의 디자인 토큰·컴포넌트(`<fd.*>`)와 `@ferdy/bridge` 이벤트 버스를 통해 OS와 일관된 경험 및 통신을 제공합니다.

| 카테고리 | 앱 이름 | 패키지 / 경로 | 핵심 기능 |
| :--- | :--- | :--- | :--- |
| `builtin` | **Clock** | `@ferdy/builtin-clock`<br>`/domains/builtin/clock/` | `@ferdy/ui` 토큰 기반 실시간 디지털 시계 및 `24H` / `12H` 포맷 전환 위젯 앱 |
| `builtin` | **Calendar** | `@ferdy/builtin-calendar`<br>`/domains/builtin/calendar/` | 월간 캘린더 탐색, 오늘(Today) 이동, 선택 일자 D-Day 표시 및 날짜별 한 줄 메모(`localStorage` 저장·셀 도트 인디케이터) 지원 위젯 앱 |
| `builtin` | **Notes** | `@ferdy/builtin-notes`<br>`/domains/builtin/notes/` | 좌측 사이드바 기반 다중 메모 관리(추가/전환/삭제), `localStorage` 실시간 자동 저장, `Edit` ↔ `Preview` 마크다운 미리보기 전환 및 글꼴 크기 조절(`11px ~ 28px`) 지원 앱 |
| `sample` | **Sample App** | `@ferdy/sample-app`<br>`/domains/sample/app/` | `@ferdy/ui` 컴포넌트(`Button`, `Badge`)와 `@ferdy/bridge`(`ping`, `openWindow`) 통신을 시연하는 표준 레퍼런스 앱 |
| `sample` | **Hello World** | `@ferdy/sample-hello`<br>`/domains/sample/hello/` | 최소 구성(Minimal) 도메인 앱 구조 및 공통 스타일시트 연동 검증 앱 |

---

## 3. Roadmap (향후 방향)

세부 작업 항목과 아이디어는 [todo.md](./todo/todo.md)에서 관리하며, 중장기 주요 마일스톤은 다음과 같습니다.

- **테마 시스템 고도화**: `FERDY_THEME_CHANGE` 브로드캐스트 기반 런타임 다크/라이트 테마 전환 및 추가 테마 세트 지원
- **Window Manager UX 고도화**: 창 스냅(Window Snapping), 시작 메뉴(Start Menu) 앱 런처, 창 위치·크기·열린 상태 `localStorage` 세션 복원
- **시스템 · 유틸리티 도메인 앱 확장**: 브릿지 이벤트/창 인스펙터(`app-monitor`), OS 환경설정(`app-settings`) 등 실용 앱 추가
