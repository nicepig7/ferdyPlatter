# v0.1.9 — `@ferdy/ui` Web Components (`Lit`) & 2-Layer Hybrid Architecture

> **상위 문서**: [todo.md](./todo.md) | **상세 설계**: [todo.webCompo.md](./todo.webCompo.md) | **릴리즈 노트**: [releases.0.1.md](../releases/releases.0.1.md)

---

## 🎯 버전 목표 (Milestone Goals)

1. **프레임워크 중립 UI 표준화 (`Lit` 기반 Web Components 도입)**:
   - SolidJS(`@ferdy/core`, `builtin/*`, `sample/*`), React 19(`@ferdy/work-task-react`), Vue 3(`@ferdy/work-task-vue`) 모든 환경에서 Vite 빌드 충돌 없이 동작하는 **`@ferdy/ui/elements`** 엔트리를 구축합니다.
2. **2층 하이브리드 UI 아키텍처 정립**:
   - **1층 (Style Layer — `@ferdy/ui/styles.css`)**: 네이티브 HTML 기능(폼 제출, `v-model`, 접근성)이 중요한 단순 요소(`.fd-btn`, `.fd-badge`, `.fd-card`, `.fd-input` 등)를 순수 CSS 컴포넌트 클래스로 정비합니다.
   - **2층 (Web Component Layer — `@ferdy/ui/elements`)**: 자체 상태와 인터랙션 로직이 풍부한 독립 위젯(`<fd-text-field>`, `<fd-select>`, `<fd-switch>`, `<fd-tabs>`)을 `LitElement` 기반 커스텀 엘리먼트로 제공합니다.
3. **Sample 컴포넌트 쇼케이스 앱 신설 및 기존 도메인 앱 전면 갱신**:
   - `packages/domains/sample/components` (`@ferdy/sample-components`) 앱을 신설하여 1층 Style Layer와 2층 Web Components의 모든 상태·옵션·검증 규칙을 한눈에 테스트할 수 있는 인터랙티브 플레이그라운드를 제공합니다.
   - 기존 도메인 앱(`task-react`, `task-vue`, `builtin-calendar`, `builtin-notes`, `builtin-clock`)의 자체 중복 UI 구현을 새로운 `@ferdy/ui` (`styles.css` + `elements`) 기반으로 전환합니다.

---

## 🏗️ 아키텍처 개요

```text
[B] @ferdy/ui (packages/base/ui/)
 ├── "."            (SolidJS 컴포넌트 엔트리 — Core / Solid 앱 호환)
 ├── "./styles.css" (1층 Style Layer — 전 프레임워크 공통 CSS 토큰 & .fd-btn, .fd-badge, .fd-card, .fd-input)
 └── "./elements"   (2층 Web Component Layer — Lit 기반 커스텀 엘리먼트)
       ├── <fd-text-field> : 아이콘, clearable(X), info/pass/fail 메시지, instant/lazy Rule 검증
       ├── <fd-select>     : 커스텀 드롭다운 선택기 (키보드 탐색, 옵션 리스트, delegatesFocus)
       ├── <fd-switch>     : 토글 스위치 (checked, size, label, 접근성 role="switch")
       └── <fd-tabs>       : 세그먼트/탭 전환 위젯 (활성 탭 상태 및 키보드 방향키 이동)
          │
          ▼  (프레임워크 무관 import: '@ferdy/ui/styles.css' + '@ferdy/ui/elements')
[D] Domains (Iframe Sandboxes)
 ├── [New] @ferdy/sample-components (/domains/sample/components/ — UI 쇼케이스 & 플레이그라운드)
 ├── @ferdy/work-task-react         (React 19 — 검색바/QuickAdd/필터/드롭다운 전환)
 ├── @ferdy/work-task-vue           (Vue 3 — 검색바/QuickAdd/필터/드롭다운 전환)
 └── @ferdy/builtin-*               (SolidJS — Calendar 메모 입력, Notes, Clock 등 전환)
```

---

## 📐 핵심 설계 결정 및 컨벤션 (Design Decisions & Context)

다음 구현 세션에서 일관되게 준수해야 할 기술적 의사결정 사항입니다.

1. **`Lit` 데코레이터 방식 채택 & 서브 프로젝트 Class Field Shadowing 방지**:
   - **결정**: 가독성과 단일 선언(Single Source of Truth) 유지보수성을 위해 `@customElement`, `@property`, `@state` (`lit/decorators.js`) **데코레이터 방식**을 표준으로 사용합니다.
   - **주의사항 (Class Field Shadowing)**: TypeScript `"target": "ESNext"` 환경의 기본값(`useDefineForClassFields: true`)으로 컴파일되면 클래스 필드 초기화(`checked = false;`)가 `Object.defineProperty`로 동작하여, `Lit`이 프로토타입에 생성한 반응형 `getter / setter`를 덮어써서 화면 갱신이 먹통이 됩니다.
   - **보완책**: 모노레포 내 모든 패키지(`@ferdy/ui`, `@ferdy/core`, `react.json`, `vue.json` 및 각 도메인 앱)가 공통 상속하는 **`packages/base/tsconfig/base.json`** 한 곳에 아래 설정을 추가하여 어느 서브 프로젝트에서 원본 `.ts`를 번들링하더라도 동일한 변환 규칙을 보장합니다.
     ```json
     "experimentalDecorators": true,
     "useDefineForClassFields": false
     ```
2. **`@ferdy/ui/elements` 파일 네이밍 및 구조 컨벤션**:
   - 기존 SolidJS 컴포넌트(`src/components/<name>/fdCompo.<name>.tsx`)와 명확히 구분되도록 `src/elements/` 하위에 **`fdElem.<name>.ts`** 접두어를 사용합니다.
   - 디렉토리 구조:
     - `packages/base/ui/src/elements/index.ts` (`@ferdy/ui/elements` 공개 엔트리)
     - `packages/base/ui/src/elements/common/fdElem.icon.ts` (Shadow DOM 내부용 `lucide-static` 인라인 `<svg>` 렌더링 헬퍼)
     - `packages/base/ui/src/elements/text-field/fdElem.textField.ts` (`<fd-text-field>`)
     - `packages/base/ui/src/elements/select/fdElem.select.ts` (`<fd-select>`)
     - `packages/base/ui/src/elements/switch/fdElem.switch.ts` (`<fd-switch>`)
     - `packages/base/ui/src/elements/tabs/fdElem.tabs.ts` (`<fd-tabs>`)
     - `packages/base/ui/src/elements/fdElem.jsx.d.ts` (SolidJS / React 19 / Vue 3 공통 Custom Elements 타입 선언)
3. **Shadow DOM 아이콘 및 스타일 캡슐화**:
   - 전역 `.icon-*` CSS 클래스는 Shadow DOM 경계를 통과하지 못하므로, `lucide-static`의 SVG 문자열을 기반으로 Shadow DOM 내부에 인라인 `<svg>`를 직접 렌더링하는 헬퍼(`renderFdIcon(name, size)`)를 기본 사용하고, 외부 커스텀 요소 주입을 위해 Named Slot(`slot="left-icon"`, `slot="right-icon"`)을 병행 지원합니다.
   - 컬러, 폰트, 반경, 간격은 Shadow DOM을 자연스럽게 통과하는 `--fd-*` CSS 디자인 토큰을 그대로 참조합니다.
4. **프레임워크 간 이벤트 & 바인딩 규격**:
   - 모든 상태 변경 이벤트는 Shadow DOM 바깥으로 전파되도록 `{ bubbles: true, composed: true }` 옵션을 반드시 포함합니다.
   - 네이티브 호환을 위한 표준 `input`/`change` 이벤트와 함께, `detail` 페이로드(`{ value }`, `{ checked }`)를 타입 안전하게 전달하는 `fd-input`, `fd-change`, `fd-clear` 커스텀 이벤트를 발행합니다.

---

## ✅ 세부 작업 Task 목록

### Phase 1: 버전 준비 및 `Lit` · `@ferdy/ui/elements` PoC 기반 구축
- [x] **버전 상향**: 루트 및 워크스페이스 `package.json` 버전을 `0.1.8` → `0.1.9`로 상향 (총 14개 패키지)
- [ ] **`@ferdy/tsconfig` 데코레이터 공통 설정 (`packages/base/tsconfig/base.json`)**:
  - `"experimentalDecorators": true`, `"useDefineForClassFields": false` 추가
- [ ] **`@ferdy/ui` 의존성 및 엔트리 구성 (`packages/base/ui/`)**:
  - `lit` 의존성 추가 및 `package.json` `exports`에 `"./elements": "./src/elements/index.ts"` 정의
- [ ] **멀티 프레임워크 Vite 설정 정비**:
  - `packages/core/vite.config.ts` 및 `packages/domains/work/task-vue/vite.config.ts`의 `vuePlugin`에 `template.compilerOptions.isCustomElement: (tag) => tag.startsWith('fd-')` 설정
  - Core(SolidJS), `task-react`(React 19), `task-vue`(Vue 3)에서 `<fd-*>` 태그 렌더링 및 데코레이터 반응성 무충돌 PoC 검증

### Phase 2: 1층 Style Layer(`.fd-*`) 정비 & Shadow DOM 아이콘 유틸 구축
- [ ] **Style Layer 정리 (`@ferdy/ui/styles.css`)**:
  - 기존 `fdCompo.*.css`(`Button`, `Badge`, `Card`, `Input` 등)를 `@ferdy/ui/styles.css`에서도 일관되게 사용할 수 있도록 `.fd-btn`, `.fd-badge`, `.fd-card`, `.fd-input` 클래스 및 `@layer components` 구조 정비
- [ ] **Shadow DOM 아이콘 렌더링 유틸 구축 (`src/elements/common/fdElem.icon.ts`)**:
  - `lucide-static` 아이콘을 Shadow DOM 내부에서 인라인 `<svg>`로 안전하게 렌더링하는 `Lit` 헬퍼 구현 (Named Slot 폴백 포함)

### Phase 3: `<fd-text-field>` 핵심 스펙 구현 및 3종 프레임워크 테스트
- [ ] **`<fd-text-field>` (`src/elements/text-field/fdElem.textField.ts`) 구현**:
  - `static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }` 및 `tabIndex` 처리
  - 입력 시작 시 우측 지우기(`X`) 버튼 자동 노출, 클릭 시 값 초기화 + 포커스 복원 (`tabindex="-1"` 부여로 Tab 이동 방해 방지)
  - 좌측 / 우측 아이콘 지원 (`left-icon`, `right-icon` 속성 및 Named Slot)
  - 하단 헬퍼 메시지 영역 (`status`: `'info' | 'pass' | 'fail'`, `message` 속성)
  - Rule 검증 지원 (`rules` 프로퍼티, `validate-on`: `'instant' | 'lazy'`, 외부 호출용 `validate()` 및 `resetValidation()` 메서드 노출)
- [ ] **SolidJS `fd.TextField` 호환 정리**:
  - 기존 SolidJS 엔트리(`fd.TextField`)와 `<fd-text-field>` 간 역할 정리 또는 호환 유지

### Phase 4: 실전 활용 Web Component 후보군 추가 구현 (`@ferdy/ui/elements`)
도메인 앱들에서 반복 사용되는 상호작용 위젯을 `LitElement` 기반 커스텀 엘리먼트로 추가 구현합니다.
- [ ] **`<fd-select>` (`src/elements/select/fdElem.select.ts` — 커스텀 셀렉트 드롭다운)**:
  - `options` (`{ value: string; label: string; icon?: string; disabled?: boolean }[]`), `value`, `placeholder`, `size` (`'sm' | 'md'`), `disabled` 지원
  - 키보드 탐색(`ArrowUp`, `ArrowDown`, `Home`, `End`, `Enter`, `Escape`), 외부 클릭 닫기, `fd-change` 커스텀 이벤트 발생
- [ ] **`<fd-switch>` (`src/elements/switch/fdElem.switch.ts` — 토글 스위치)**:
  - `checked`, `disabled`, `size` (`'sm' | 'md'`), `label` 표시, `role="switch"` 및 `Space`/`Enter` 키보드 토글, `fd-change` 이벤트 발생
- [ ] **`<fd-tabs>` (`src/elements/tabs/fdElem.tabs.ts` — 세그먼트 / 탭 스위치)**:
  - `items` (`{ value: string; label: string; count?: number; icon?: string }[]`), `value`, `variant` (`'pill' | 'underline' | 'segmented'`), `size` (`'sm' | 'md'`), 키보드 좌우 방향키 포커스 이동 및 `fd-change` 이벤트 발생

### Phase 5: TypeScript DX (Custom Elements 타입 선언) 정리
- [ ] **프레임워크별 `<fd-*>` 타입 선언(`src/elements/fdElem.jsx.d.ts`) 구성**:
  - `HTMLElementTagNameMap`에 `'fd-text-field'`, `'fd-select'`, `'fd-switch'`, `'fd-tabs'` 등록
  - React 19 (`JSX.IntrinsicElements`), Vue 3 (`GlobalComponents`), SolidJS (`JSX.IntrinsicElements`) 모두에서 커스텀 태그 속성/이벤트 자동완성 및 `npm run typecheck` 통과 보장

### Phase 6: Sample 도메인 컴포넌트 쇼케이스 앱 신설 (`@ferdy/sample-components`)
- [ ] **앱 스캐폴딩 (`packages/domains/sample/components/`)**:
  - 패키지명 `@ferdy/sample-components`, 서빙 경로 `/domains/sample/components/` 생성
  - Core 앱 매니페스트(`fdCore.app.manifest.meta.ts`) 및 바탕화면 바로가기(`fdCore.app.shortcuts.meta.ts`) 등록
- [ ] **쇼케이스 & 인터랙티브 플레이그라운드 UI 구현**:
  - **1층 Style Layer 탭**: `.fd-btn` (variant/size별), `.fd-badge`, `.fd-card`, `.fd-input` 프리뷰
  - **2층 Web Components 탭**:
    - `<fd-text-field>`: `clearable`, 좌/우 아이콘, `info`/`pass`/`fail` 상태, `instant` vs `lazy` Rule 검증(`validate()` 버튼 포함) 및 다중 필드 연속 `Tab` 포커스 이동 테스트
    - `<fd-select>`, `<fd-switch>`, `<fd-tabs>`: 옵션 변경, 비활성화 토글, 실시간 커스텀 이벤트(`fd-change`, `fd-input`, `fd-clear`) 로그 인스펙터 표시

### Phase 7: 기존 도메인 앱 `@ferdy/ui` (Web Component & Style Layer) 적용 갱신
새로 구축한 1층 Style Layer(`.fd-*`)와 2층 Web Components(`<fd-*>`)를 기존 앱들에 실제 적용하여 중복 코드를 제거하고 UI 일관성을 검증합니다.
- [ ] **`@ferdy/work-task-react` & `@ferdy/work-task-vue` 갱신**:
  - Quick Add 폼의 제목/메모 `<input>`을 `<fd-text-field>`로 교체 (제목 필수 입력 Rule 검증 연동)
  - Quick Add 폼의 Category / Priority `<select>`를 `<fd-select>`로 교체
  - Filter Bar의 자체 구현 검색창(`.task-search-box` + 수동 X 버튼)을 `<fd-text-field left-icon="search" clearable>`로 교체
  - 상태 필터 탭(`All | Todo | In Progress | Done`)에 `<fd-tabs>` 적용 및 공통 버튼/배지에 1층 `.fd-btn`, `.fd-badge` 클래스 적용
- [ ] **`@ferdy/builtin-calendar` 갱신**:
  - `CalendarFooter`의 한 줄 메모 입력을 `<fd-text-field>` Web Component 기반으로 전환
- [ ] **`@ferdy/builtin-clock` & `@ferdy/builtin-notes` 갱신**:
  - `builtin-clock`: `24H / 12H` 포맷 전환에 `<fd-switch>`(또는 `<fd-tabs>`) 적용
  - `builtin-notes`: `Edit / Preview` 모드 전환에 `<fd-tabs>` 적용 및 제목 입력 영역 정비
- [ ] **통합 검증** *(릴리즈는 이후 수동 진행)*:
  - 루트 `npm run typecheck` 및 `npm run build` 무오류 통과 확인
