# Release Notes

**Ferdy Platter (FerdyOS)**의 버전별 주요 변경 사항과 이력을 기록합니다.

> **문서 구성 안내**:
> - 이 파일(`releases.md`)은 전체 버전 요약과 마이너 버전별 인덱스 역할을 합니다.
> - 각 마이너 버전 시리즈의 상세 변경 이력(`Added`, `Changed`, `Fixed`)은 `docs/releases/releases.<major>.<minor>.md` 파일에서 관리합니다.

---

## Latest Release

- **[0.1.7] — App & Window Management (WIP)**: 앱 및 윈도우 관리 기능 고도화 (작업 진행 중) → [상세 보기](./releases.0.1.md#017---app--window-management-wip)

---

## Minor Version Series

| 시리즈 | 포함 버전 | 주요 테마 | 상세 문서 |
| :--- | :--- | :--- | :--- |
| **0.1.x** | `0.1.0` ~ `0.1.7` | Monorepo 구축, A-B-C-D-E 아키텍처, `@ferdy/ui` & `@ferdy/bridge`, Core 레지스트리, 기본 도메인 앱, App/Window 고도화 | [releases.0.1.md](./releases.0.1.md) |

---

## Version Index (`0.1.x`)

- **[0.1.7](./releases.0.1.md#017---app--window-management-wip)** — App & Window Management (작업 진행 중)
- **[0.1.6](./releases.0.1.md#016---builtin-apps-calendar--notes-desktop-grid--tones-uicoredomains-architecture-standardization)** — Calendar·Notes Builtin 앱 신설, 바탕화면 그리드·톤 프리셋, `@ferdy/tsconfig` & UI/Core/Domains 구조 표준화
- **[0.1.5](./releases.0.1.md#015---app-manifest-registry-servicesapp-metats-convention--brand-identity-fdplatter)** — App Manifest Registry (`services/app/`), `.meta.ts` 규칙, 브랜드 로고(`fdPlatter`), 활성 창 새로고침
- **[0.1.4](./releases.0.1.md#014---desktop-squircle-icons-typography-pretendard--d2coding--core-component-refactoring)** — SVG 스쿼클 아이콘, `Pretendard` + `D2Coding` 웹폰트, Core 컴포넌트 폴더화 및 `fdShell.*` 접두어
- **[0.1.3](./releases.0.1.md#013---ferdyui-design-system-layer-architecture--icon-system)** — `@ferdy/ui` CSS `@layer` 아키텍처, `fd.Icon`, 테라코타/포레스트 그린 컬러 테마
- **[0.1.2](./releases.0.1.md#012---a-b-c-d-e-architecture-ferdyui--ferdybridge)** — A-B-C-D-E 워크스페이스 계층, `@ferdy/ui` & `@ferdy/bridge` 신설, `@ferdy/core` 전환
- **[0.1.1](./releases.0.1.md#011---clock-app--documentation)** — `@ferdy/app-clock` 신설, `iframe` 여백 보정, `docs/` 지식 베이스 수립
- **[0.1.0](./releases.0.1.md#010---initial-prototype)** — Monorepo 기반, Web OS 코어/윈도우 매니저, `@ferdy/app-sample` 프로토타입
