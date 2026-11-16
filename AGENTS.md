# Ferdy Platter — AI Agent Guidelines (`AGENTS.md`)

이 문서는 AI 에이전트가 `ferdy-platter` 워크스페이스에서 코드를 작성, 수정, 분석할 때 항상 준수해야 하는 핵심 규칙입니다.

---

## 1. 기술 스택 및 프레임워크 규칙 (SolidJS 필수 주의사항)

이 프로젝트는 **React가 아닌 SolidJS (`solid-js`)** + **Vite** + **TypeScript**를 사용합니다. 코드 작성 시 React 습관을 섞지 않도록 아래 규칙을 엄격히 지킵니다.

1. **반응성(Reactivity) 유지**:
   - 컴포넌트의 `props`를 구조 분해 할당(`const { window } = props;`)하지 마세요. 구조 분해하는 순간 반응성 추적이 끊깁니다. 항상 `props.window.title`처럼 접근하거나 필요한 경우 `splitProps` / `mergeProps`를 사용합니다.
   - Signal 값을 읽을 때는 반드시 함수 호출 형태(`count()`, `isInteracting()`)로 읽어야 합니다.
2. **JSX 속성 표기**:
   - `className` 대신 표준 HTML 속성인 `class` 및 Solid 전용 `classList={{ 'is-active': ... }}`를 사용합니다.
   - 인라인 스타일 객체를 사용할 때는 CSS 케밥 케이스 속성명(`'min-height'`, `'z-index'`, `'flex-direction'`)을 권장합니다.
3. **제어 흐름 및 리스트 렌더링**:
   - 배열 렌더링 시 `.map()` 대신 `<For each={...}>` (참조 기준) 또는 `<Index each={...}>` (인덱스 기준) 컴포넌트를 사용합니다. 특히 창 목록(`windowStore.state.windows`)에서 `.map()`을 쓰면 상태 변경 시 `iframe`이 통째로 재생성될 수 있으므로 반드시 `<For>`를 사용해야 합니다.
   - 조건부 렌더링 시 삼항 연산자 남용 대신 `<Show when={...}>` 컴포넌트를 우선 사용합니다.
4. **생명주기 및 클린업**:
   - `useEffect` 대신 `createEffect`, 마운트 시 1회 실행은 `onMount`, 정리는 `onCleanup`을 사용합니다.

---

## 2. 모노레포 및 A-B-C-D-E 아키텍처 규칙 (Single-Server MPA)

1. **워크스페이스 구조 (`packages/` 하위 A-B-C-D-E 계층)**:
   - **[A] `packages/assets` (`@ferdy/assets`)**: 공용 정적 에셋(`public/assets/...`) 및 에셋 상수 정의.
   - **[B] `packages/base/*` (`@ferdy/bridge`, `@ferdy/ui`)**:
     - `@ferdy/bridge`: Core와 Domain Apps 간의 타입 안전 `postMessage` Pub/Sub 이벤트 버스.
     - `@ferdy/ui`: 공통 CSS 디자인 토큰(`--fd-*`), Base 리셋/유틸리티 클래스(`.fd-*`), 공통 SolidJS UI 컴포넌트(`fd.Button` / `FdButton` / `Button`, `fd.Badge` / `FdBadge` / `Badge`, `fd.Card` / `FdCard` / `Card`).
   - **[C] `packages/core` (`@ferdy/core`)**: OS 데스크탑, 태스크바, 윈도우 매니저, 그리고 하위 도메인 앱들을 서빙하는 단일 Vite 서버 게이트웨이 호스트.
   - **[D] `packages/domains/*` (`@ferdy/app-<name>`)**: `iframe` 샌드박스 내부에서 독립 실행되는 개별 도메인 웹 앱.
   - **[E] `packages/etc`**: 기타 실험적 모듈, 외부 연동 어댑터, 유틸리티 공간.
2. **Core ↔ Domain App 격리 원칙**:
   - 개별 앱(`packages/domains/*`)은 Core의 내부 스토어(`windowStore` 등)를 직접 import해서는 안 됩니다.
   - 앱과 Core 간의 모든 상호작용은 `@ferdy/bridge` (`ferdyBridge`)를 통해 이루어져야 하며, 공통 Look & Feel은 `@ferdy/ui`를 통해 일관되게 유지합니다.
3. **앱 라우팅 규격**:
   - 모든 도메인 앱은 `/apps/<폴더명>/` 경로로 서빙됩니다. (`packages/core/vite.config.ts`의 `monorepoDomainsGatewayPlugin`이 `packages/domains/<폴더명>/`과 자동 매핑)

---

## 3. 문서 및 정보 관리 동기화 규칙 (Documentation Sync)

코드 변경 시 프로젝트의 정보 관리 체계가 항상 최신 상태를 유지하도록 다음 문서를 함께 점검하고 업데이트합니다.

- **아키텍처, 빌드 설정, `@ferdy/bridge` 프로토콜 변경 시**: [docs/architecture.md](./docs/architecture.md) 업데이트
- **새로운 OS 기능 구현 또는 로드맵 항목 완료 시**: [docs/features.md](./docs/features.md) 및 [docs/releases.md](./docs/releases.md) 업데이트
- **각 패키지(`assets`, `base/*`, `core`, `domains/*`)의 주요 컴포넌트나 구조 변경 시**: 해당 패키지 내부의 `README.md` 업데이트
- **새로운 도메인 앱(`packages/domains/<app-name>`) 추가 시**: `.agents/skills/create-new-app/SKILL.md` 스킬 절차를 따르고, 해당 앱 폴더에 `README.md`를 반드시 생성합니다.

---

## 4. 검증 (Verification)

코드 수정을 마친 후에는 작업 완료 보고 전에 루트에서 아래 명령어로 타입 오류가 없는지 확인합니다.
```bash
npm run typecheck
```
