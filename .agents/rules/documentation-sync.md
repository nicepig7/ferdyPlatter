# Documentation & Information Management Rules

`ferdy-platter` 프로젝트의 모든 문서는 역할별로 분리되어 있으며, 에이전트는 기능 추가나 리팩토링 시 코드와 문서를 함께 동기화해야 합니다.

## 문서 계층별 역할

1. **Root `README.md`**:
   - 깃허브 방문자 및 신규 개발자를 위한 프로젝트 개요, A-B-C-D-E 워크스페이스 구조, 빠른 실행 명령어, 문서 링크 허브 역할만 수행합니다.
   - 너무 깊은 구현 세부사항은 루트 `README.md`에 직접 적지 않고 `docs/` 하위 문서로 위임합니다.
2. **Package `README.md` (`packages/assets/README.md`, `packages/base/*/README.md`, `packages/core/README.md`, `packages/domains/*/README.md`)**:
   - 해당 워크스페이스 모듈의 역할, 내부 디렉토리 구조, 주요 상태/컴포넌트/API, 단독 실행 및 테스트 방법을 설명합니다.
3. **`docs/` 폴더**:
   - `docs/architecture.md`: A-B-C-D-E 계층 설계, Single-Server MPA 구조, Vite 게이트웨이 플러그인, `@ferdy/ui` 디자인 시스템, `@ferdy/bridge` 통신 규격 등 시스템 전반의 설계를 다룹니다.
   - `docs/features.md`: 현재 구현된 기능 체크리스트와 향후 로드맵을 관리합니다.
   - `docs/releases.md`: 버전별 주요 변경 사항을 기록합니다.
