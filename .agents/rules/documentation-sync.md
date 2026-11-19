# Documentation & Information Management Rules

`ferdy-platter` 프로젝트의 모든 문서는 역할별로 분리되어 있으며, 에이전트는 기능 추가나 리팩토링 시 코드와 문서를 함께 동기화해야 합니다.

## 문서 계층별 역할

1. **Root `README.md`**:
   - 깃허브 방문자 및 신규 개발자를 위한 프로젝트 개요, A-B-C-D-E 워크스페이스 구조, 빠른 실행 명령어, 문서 링크 허브 역할만 수행합니다.
   - 너무 깊은 구현 세부사항은 루트 `README.md`에 직접 적지 않고 `docs/` 하위 문서로 위임합니다.
2. **Package `README.md` (`packages/assets/README.md`, `packages/base/*/README.md`, `packages/core/README.md`, `packages/domains/<category>/*/README.md`, `packages/externs/*/README.md`)**:
   - 해당 워크스페이스 모듈의 역할, 내부 디렉토리 구조, 주요 상태/컴포넌트/API, 단독 실행 및 테스트 방법을 설명합니다.
   - 각 패키지의 주요 컴포넌트나 구조 변경 시 해당 `README.md`를 함께 업데이트합니다.
   - 새로운 도메인 앱(`packages/domains/<category>/<app-name>`) 추가 시 `.agents/skills/create-new-app/SKILL.md` 절차를 따르고, 해당 앱 폴더에 `README.md`를 반드시 생성합니다.
3. **`docs/` 폴더**:
   - `docs/architecture.md`: A-B-C-D-E 계층, Single-Server MPA, Vite 게이트웨이, `@ferdy/ui`, `@ferdy/bridge` 등 **구현된 시스템 설계**
   - `docs/features.md`: **구현 완료 기능** 체크리스트 및 **로드맵**
   - `docs/releases/`: 전체 릴리즈 인덱스(`releases.md`) 및 마이너 버전별 상세 변경 이력(`releases.<major>.<minor>.md`, `Added`, `Changed`, `Fixed`)
   - `docs/todo/`: 단기 할 일·아이디어(`todo.md`) 및 주제별 브레인스토밍(`todo.<topic>.md`)

## `docs/` 수정 규칙
- **기존 체계 우선**: 새 문서를 임의로 만들지 말고 위 4개 영역 중 맞는 위치에 작성합니다. (주제별 메모는 `docs/todo/todo.<topic>.md`, 마이너 버전별 릴리즈 노트는 `docs/releases/releases.<major>.<minor>.md`)
- **사실과 계획 분리**: 구현 완료된 내용만 `architecture.md`, `features.md`(Current), `docs/releases/`에 적고, 미구현 아이디어는 `docs/todo/` 또는 로드맵에 분리합니다.
- **생명주기 동기화**: `docs/todo/` 항목을 구현하면 `features.md`·`docs/releases/`에 반영하고 `todo.md`에서 정리합니다. 구조·프로토콜 변경 시 `architecture.md`도 함께 갱신합니다.
- **허브 동기화**: `docs/` 하위 파일을 추가·이동·삭제하면 루트 `README.md`의 구조/링크도 함께 수정합니다.
