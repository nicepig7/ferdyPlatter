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
     - `@ferdy/ui`:
       - CSS `@layer` 계층(`@layer reset, tokens, theme, libraries, base, components;`) 및 전역 스타일시트(`fdStyle.*.css`)
       - 공통 CSS 디자인 토큰(`--fd-*`), Base 리셋/유틸리티 클래스(`.fd-*`)
       - 폴더별로 격리 및 Co-location된 SolidJS UI 컴포넌트(`components/<name>/fdCompo.<name>.tsx` & `fdCompo.<name>.css`) 및 `fd.*` 네임스페이스(`fd.Button`, `fd.Badge`, `fd.Card`, `fd.Icon`)
   - **[C] `packages/core` (`@ferdy/core`)**:
     - OS 데스크탑, 태스크바, 윈도우 매니저, 앱 레지스트리, 그리고 하위 도메인 앱들을 서빙하는 단일 Vite 서버 게이트웨이 호스트.
     - `src/` 최상위 구조는 UI 뷰 계층(`components/`), 상태·레지스트리 서비스 계층(`services/<domain>/`), 타입 정의 계층(`types/`)으로 구분합니다.
     - 역할별 파일 접두어/접미어 규칙 (Core 1차 구분: `fdShell` / `fdCore`):
       - OS 셸 UI 컴포넌트·스타일·훅 (`components/`): `fdShell.<domain>.tsx` / `.css` / `.hooks.ts`
       - 상태 스토어 (`services/<domain>/`): `fdCore.<domain>.store.ts`
       - 브릿지·서비스 (`services/<domain>/`): `fdCore.<domain>.service.ts`
       - 초기 등록 메타데이터 (`services/<domain>/`): `fdCore.<domain>.<kind>.meta.ts` — 메타 정보를 저장하는 파일은 반드시 접미사(postfix)로 `.meta`를 붙이며, **한 파일에 한 종류의 데이터만 관리**합니다.
       - 타입 정의 (`types/`): `fdCore.<domain>.type.ts`
   - **[D] `packages/domains/<category>/*` (`@ferdy/<category>-<name>`)**: `iframe` 샌드박스 내부에서 독립 실행되는 개별 도메인 웹 앱 (`builtin/*`, `sample/*` 등 카테고리별 그룹화).
   - **[E] `packages/etc`**: 기타 실험적 모듈, 외부 연동 어댑터, 유틸리티 공간.
2. **Core ↔ Domain App 격리 원칙**:
   - 개별 앱(`packages/domains/**`)은 Core의 내부 스토어(`windowStore` 등)를 직접 import해서는 안 됩니다.
   - 앱과 Core 간의 모든 상호작용은 `@ferdy/bridge` (`ferdyBridge`)를 통해 이루어져야 하며, 공통 Look & Feel은 `@ferdy/ui`를 통해 일관되게 유지합니다.
3. **앱 라우팅 규격**:
   - 모든 도메인 앱은 `/domains/<category>/<app-name>/` 경로로 서빙됩니다. (`packages/core/vite.config.ts`의 `monorepoDomainsGatewayPlugin`이 `packages/domains/<category>/<app-name>/`을 재귀 스캔하여 자동 매핑)

---

## 3. 검증 (Verification)

코드 수정을 마친 후에는 작업 완료 보고 전에 루트에서 아래 명령어로 타입 오류가 없는지 확인합니다.
```bash
npm run typecheck
```
