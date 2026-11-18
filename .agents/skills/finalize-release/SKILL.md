---
name: finalize-release
description: >-
  Use this skill when the user asks to finalize, close, or wrap up a release
  version (e.g., closing 0.1.7) in the Ferdy Platter (FerdyOS) monorepo by
  cleaning up or refactoring code, reviewing and updating root and package
  README.md files, syncing docs/ (release notes, features, architecture, todo),
  and committing and pushing the finalized version.
---

# Finalize Release Version (`finalize-release`)

이 스킬은 `ferdy-platter` 모노레포에서 현재 작업 중인 버전(예: `0.1.7`)을 마감(Release Finalization)할 때 수행하는 표준 절차입니다.
다음 버전 번호 상향(Version Bump)은 포함하지 않으며, **현재 버전의 코드 정리 → README 검토 → `docs/` 최신화 → Commit & Push** 과정을 일관되게 수행합니다.

---

## 1. 불필요한 파일/코드 정리 및 리팩토링 (`Code Cleanup & Refactoring`)

1. **변경 범위 점검**:
   - 이전 버전 마감 커밋 이후의 커밋 로그(`git log --oneline`)와 현재 작업 트리 상태(`git status`, `git diff`)를 확인하여 이번 버전에서 추가·수정된 패키지 및 파일 범위를 파악합니다.
2. **불필요한 파일 및 코드 정리**:
   - 미사용 파일, 임시 파일, 주석 처리된 죽은 코드(Dead Code), 미사용 `import`/변수/타입/헬퍼 함수, 중복 로직이 있는지 점검하고 정리합니다.
3. **프로젝트 컨벤션 및 아키텍처 규칙 점검 (`AGENTS.md`)**:
   - **SolidJS 반응성 규칙**: `props` 구조 분해 금지(`props.*` 직접 접근 또는 `splitProps`/`mergeProps`), 리스트 `<For>` / 조건부 `<Show>` 사용, `class` 및 `classList` 사용, 인라인 스타일 케밥 케이스 준수 여부를 확인합니다.
   - **A-B-C-D-E 계층 및 파일 네이밍**: Core UI 셸(`fdShell.<domain>.*`), Core 스토어/서비스/메타/타입(`fdCore.<domain>.store.ts`, `fdCore.<domain>.service.ts`, `fdCore.<domain>.<kind>.meta.ts`, `fdCore.<domain>.type.ts`), Core ↔ Domain 격리 원칙(`@ferdy/bridge` 경유) 위반 여부를 확인합니다.
4. **타입 및 빌드 검증**:
   - 루트에서 `npm run typecheck` (필요 시 `npm run build`)를 실행하여 오류가 없는지 확인합니다.
5. **리팩토링 커밋 분리 (변경 사항이 있는 경우)**:
   - 이 단계에서 코드 수정이나 파일 정리가 발생했다면, 문서 마감 커밋과 섞이지 않도록 먼저 별도의 커밋(`refactor(...): ...` 또는 `chore(...): ...`)으로 분리하여 커밋합니다.

---

## 2. `README.md` 전반 검토 및 업데이트 (`Root & Package READMEs`)

`.agents/rules/documentation-sync.md` 규칙에 따라 루트 및 하위 패키지의 `README.md`를 실제 코드와 대조하여 최신화합니다.

1. **루트 `README.md` (`/README.md`)**:
   - 핵심 특징, 워크스페이스 디렉토리 트리(`packages/` 및 `docs/`), 실행 명령어, 하단 **문서 바로가기 (Documentation Hub)** 링크 테이블이 최신 상태인지 검토하고 업데이트합니다.
2. **하위 패키지 `README.md` (`packages/**/README.md`)**:
   - 이번 버전에서 변경이 발생한 모든 패키지(`packages/assets/README.md`, `packages/base/*/README.md`, `packages/core/README.md`, `packages/domains/<category>/*/README.md`)를 검토합니다.
   - 패키지 내부 파일 구조(새로 추가된 컴포넌트, 훅, 서비스, 스토어 파일 등), 주요 기능 설명, `@ferdy/bridge` 이벤트 규격이 실제 구현과 일치하도록 업데이트합니다.

---

## 3. `docs/` 지식 베이스 및 릴리즈 노트 최신화 (`Docs Sync`)

1. **릴리즈 노트 마감 (`docs/releases/releases.<major>.<minor>.md` & `docs/releases/releases.md`)**:
   - `docs/releases/releases.<major>.<minor>.md` (예: `releases.0.1.md`):
     - 현재 버전 섹션 헤더(예: `## [0.1.7] - ... (WIP)`)에서 `(WIP)` 표기를 제거하고, 이번 버전의 핵심 변경 사항을 요약하는 최종 테마 제목을 확정합니다.
     - `Added`, `Changed`, `Fixed` 내역에 누락이나 부정확한 파일명/설명이 없는지 최종 점검합니다.
   - `docs/releases/releases.md`:
     - `## Latest Release`와 `## Version Index`에서 `(WIP)` 및 `(작업 진행 중)` 표기를 제거하고, 확정된 버전 요약 문구와 헤더 앵커 링크(`#017-...`)를 일치시킵니다.
2. **기능 명세 및 로드맵 (`docs/features.md`)**:
   - 이번 버전에서 구현 완료된 기능이 `1. OS Shell`, `2. Domain Apps` 섹션에 빠짐없이 반영되었는지 확인합니다.
   - 이미 구현 완료된 항목이 `3. Roadmap`에 중복으로 남아 있다면 정리합니다.
3. **시스템 아키텍처 (`docs/architecture.md`)**:
   - A-B-C-D-E 계층 설명, Vite 게이트웨이 동작, Core 내부 디렉토리 구조(`components/`, `services/`, `types/`), `@ferdy/ui` 컴포넌트/레이어, `@ferdy/bridge` 이벤트 테이블(`FerdyEventMap`) 중 변경된 사항이 있다면 최신화합니다.
4. **할 일 및 아이디어 메모장 (`docs/todo/todo.md`)**:
   - 이번 버전 마일스톤에서 완료된 항목(`[x]`)은 `features.md` 및 `releases`에 반영되었음을 확인한 뒤 정리하고, 남은 항목을 다음 작업 후보(`Next Up`)로 정돈합니다.
5. **에이전트 규칙 및 스킬 (`AGENTS.md`, `.agents/**`)**:
   - 아키텍처 규칙이나 워크플로우 컨벤션 변경이 있었다면 함께 반영합니다.

---

## 4. 최종 검증, Commit & Push (`Commit & Push`)

1. **최종 상태 확인**:
   - 루트에서 `npm run typecheck`를 실행하여 타입 오류가 없는지 재확인합니다.
   - `git status` 및 `git diff`로 변경된 문서와 파일 목록을 검토합니다.
2. **릴리즈 마감 커밋 생성**:
   - 문서 및 릴리즈 마감 변경분을 스테이징(`git add`)하고 일관된 형식으로 커밋합니다.
   - 커밋 메시지 형식 예시: `docs: finalize v<version> release notes and sync workspace markdown docs`
3. **원격 저장소 Push**:
   - `git push`를 실행하여 코드 리팩토링 커밋(있는 경우)과 릴리즈 마감 커밋을 원격 저장소에 반영합니다.
