# Ferdy Platter — AI Agent Guidelines (`AGENTS.md`)

이 문서는 AI 에이전트가 `ferdy-platter` 워크스페이스에서 코드를 작성, 수정, 분석할 때 항상 준수해야 하는 핵심 규칙입니다.

---

## 1. 기술 스택 및 프레임워크 규칙

### 1.1 SolidJS 필수 주의사항 (Core · `@ferdy/ui` · 기본/샘플 앱)

Core(`@ferdy/core`), 공통 UI(`@ferdy/ui`), 기본 내장/샘플 앱(`builtin/*`, `sample/*`)은 **React가 아닌 SolidJS (`solid-js`)** + **Vite** + **TypeScript**를 사용합니다. 해당 영역에서 코드 작성 시 React 습관을 섞지 않도록 아래 규칙을 엄격히 지킵니다.

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

### 1.2 멀티 프레임워크 도메인 앱 규칙 (React 19 / Vue 3)

`iframe` 샌드박스로 격리되는 도메인 앱(`packages/domains/work/*` 등)은 `packages/core/vite.config.ts`의 플러그인 스코핑을 통해 **React 19**, **Vue 3** 등 비-Solid 프레임워크로 작성할 수 있습니다.

1. **`@ferdy/ui/styles.css` 전용 로드 원칙**:
   - 비-Solid 도메인 앱은 SolidJS 런타임 및 JSX 충돌을 방지하기 위해 `@ferdy/ui`의 JS 컴포넌트 엔트리(`@ferdy/ui`)를 import하지 않고, 순수 CSS 엔트리(`import '@ferdy/ui/styles.css'`)만 로드하여 `--fd-*` 디자인 토큰, 웹폰트, 다크 테마 및 Lucide 아이콘 클래스를 공유합니다.
2. **TypeScript 프리셋 및 프레임워크 표준**:
   - React 앱은 `@ferdy/tsconfig/react.json`, Vue 앱은 `@ferdy/tsconfig/vue.json`을 확장하며, 각 프레임워크의 표준 관용구(React 19 Hooks/함수형 컴포넌트, Vue 3 `<script setup lang="ts">` Composition API)를 준수합니다.

---

## 2. 모노레포 및 A-B-C-D-E 아키텍처 규칙 (Single-Server MPA)

1. **워크스페이스 구조 (`packages/` 하위 A-B-C-D-E 계층)**:
   - **[A] `packages/assets` (`@ferdy/assets`)**: 공용 정적 에셋(`public/assets/...`) 및 정적 파일 경로 상수(`FERDY_ASSETS.paths`) 정의.
   - **[B] `packages/base/*` (`@ferdy/bridge`, `@ferdy/tsconfig`, `@ferdy/ui`)**:
     - `@ferdy/bridge`: Core와 Domain Apps 간의 타입 안전 `postMessage` Pub/Sub 이벤트 버스.
     - `@ferdy/tsconfig`: 브라우저/SolidJS 앱(`base.json`), React 앱(`react.json`), Vue 앱(`vue.json`) 및 Vite/Node 설정(`node.json`) 공통 TypeScript 설정.
     - `@ferdy/ui`:
       - CSS `@layer` 계층(`@layer reset, tokens, theme, libraries, base, components;`) 및 전역 스타일시트(`fdStyle.*.css`, 비-Solid 앱용 `@ferdy/ui/styles.css` 엔트리 제공)
       - 공통 CSS 디자인 토큰(`--fd-*`), 컴포넌트 공통 스타일(`.fd-compo`)
       - 폴더별로 격리 및 Co-location된 SolidJS UI 컴포넌트(`components/<name>/fdCompo.<name>.tsx` & `fdCompo.<name>.css`) 및 `fd.*` 네임스페이스(`fd.Button`, `fd.Badge`, `fd.Card`, `fd.Icon`, `fd.Input`, `fd.TextField`)
   - **[C] `packages/core` (`@ferdy/core`)**:
     - OS 데스크탑, 태스크바, 윈도우 매니저, 앱 레지스트리, 그리고 하위 도메인 앱들을 서빙하는 단일 Vite 서버 게이트웨이 호스트.
     - `src/` 최상위 구조는 UI 뷰 계층(`components/`), 상태·레지스트리 서비스 계층(`services/<domain>/`), 타입 정의 계층(`types/`)으로 구분합니다.
     - 역할별 파일 접두어/접미어 규칙 (Core 1차 구분: `fdShell` / `fdCore`):
       - OS 셸 UI 컴포넌트·스타일·훅 (`components/`): `fdShell.<domain>.tsx` / `.css` / `.hooks.ts`
       - 상태 스토어 (`services/<domain>/`): `fdCore.<domain>.store.ts`
       - 브릿지·서비스 (`services/<domain>/`): `fdCore.<domain>.service.ts`
       - 초기 등록 메타데이터 (`services/<domain>/`): `fdCore.<domain>.<kind>.meta.ts` — 메타 정보를 저장하는 파일은 반드시 접미사(postfix)로 `.meta`를 붙이며, **한 파일에 한 종류의 데이터만 관리**합니다.
       - 타입 정의 (`types/`): `fdCore.<domain>.type.ts`
   - **[D] `packages/domains/<category>/*` (`@ferdy/<category>-<name>`)**: `iframe` 샌드박스 내부에서 독립 실행되는 멀티 프레임워크(SolidJS, React 19, Vue 3) 개별 도메인 웹 앱 (`builtin/*`, `sample/*`, `work/*` 등 카테고리별 그룹화).
   - **[E] `packages/externs/*` (`@ferdy/extern-<domain>`)**: 시스템 외부 저장소(`localStorage`, `OPFS`, 향후 `REST API` 등) 및 창 간 동기화 I/O를 전담하는 어댑터 계층.
     - 도메인 앱(`packages/domains/**`)에는 순수 계약(`TaskExternService` 등)과 데이터 모델, 그리고 대표 서비스 퍼사드만 노출하고 세부 I/O 구현은 캡슐화합니다.
     - 역할별 파일 접두어/접미어 규칙 (`fdExtern.<domain>.*`):
       - 대표 서비스 퍼사드 & 어댑터 바인딩 (`src/`): `fdExtern.<domain>.ts`
       - 공개 계약·데이터 모델 (`src/`): `fdExtern.<domain>.type.ts`
       - 외부 I/O 구현체 (`src/`): `fdExtern.<domain>.adapter.ts`
       - 순수 유틸리티 (`src/`): `fdExtern.<domain>.util.ts`
       - 초기 시드 데이터 (`src/`): `fdExtern.<domain>.seed.ts`
2. **Core ↔ Domain App 격리 원칙**:
   - 개별 앱(`packages/domains/**`)은 Core의 내부 스토어(`windowStore` 등)를 직접 import해서는 안 됩니다.
   - 앱과 Core 간의 모든 상호작용은 `@ferdy/bridge` (`ferdyBridge`)를 통해 이루어져야 하며, 공통 Look & Feel은 `@ferdy/ui`(SolidJS 앱) 또는 `@ferdy/ui/styles.css`(비-Solid 앱)를 통해 일관되게 유지합니다.
3. **앱 라우팅 규격**:
   - 모든 도메인 앱은 `/domains/<category>/<app-name>/` 경로로 서빙됩니다. (`packages/core/plugins/monorepoDomainsGateway.ts`의 `createMonorepoDomainsGateway`가 `packages/domains/<category>/<app-name>/`을 재귀 스캔하여 자동 매핑)

---

## 3. 검증 (Verification)

코드 수정을 마친 후에는 작업 완료 보고 전에 루트에서 아래 명령어로 타입 오류가 없는지 확인합니다.
```bash
npm run typecheck
```
