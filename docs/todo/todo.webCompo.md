# `@ferdy/ui` Web Components (`Lit`) 도입 설계 & TODO

멀티 프레임워크 도메인 앱(SolidJS, React 19, Vue 3) 환경에서 `@ferdy/ui`의 UI 컴포넌트와 동작을 일관되게 공유하기 위한 **Web Components (`Lit`) 기반 표준화 PoC 및 다음 마이너 버전 작업 목록**을 정리한 문서입니다.

---

## 1. 배경 및 기술 선택 (`Lit` 채택 이유)

- 현재 `@ferdy/ui`의 기본 엔트리(`packages/base/ui/src/index.ts`)는 **SolidJS 컴포넌트**를 export하고 있습니다.
- React 19, Vue 3 등 비-Solid 도메인 앱은 JSX 컴파일러 및 반응성 모델이 달라 SolidJS 컴포넌트를 직접 import할 수 없으며, 현재는 `@ferdy/ui/styles.css`를 통해 **디자인 토큰(`--fd-*`), 테마, 웹폰트, Lucide 아이콘 클래스**만 공유하고 있습니다.
- 프레임워크 무관 Web Component 구현 기술 중 **`Lit`**을 1차 PoC 표준으로 선정한 이유는 다음과 같습니다:
  - **프레임워크 중립성 & Vite 빌드 무충돌**: JSX 트랜스폼을 쓰지 않고 표준 TypeScript(`html\`...\``, `css\`...\``)를 사용하므로, React/Vue/Solid 어느 앱에서 import하더라도 JSX 플러그인 충돌이 발생하지 않으며 특정 프레임워크 런타임이 딸려 들어가지 않음.
  - **Web Component 표준 기능 내장**: `shadowRootOptions`(`delegatesFocus`), `static styles`(`adoptedStyleSheets`), Attribute ↔ Property 자동 동기화, `ElementInternals` 등 표준 API 활용이 바닐라 JS 대비 훨씬 간결함.
  - **유지보수성**: 순수 바닐라 JS의 수동 DOM 조작 보일러플레이트를 피하면서도 ~5KB 수준의 경량 번들 유지.

---

## 2. 핵심 아키텍처 전략: 2층 하이브리드 구조

모든 UI를 Web Component로 감싸면 Shadow DOM 격리, 폼 연동, 타입 선언 비용이 과도하게 커집니다.  
따라서 컴포넌트의 복잡도와 역할에 따라 **스타일 레벨**과 **Web Component 레벨**을 명확히 분리합니다.

### 1층: Style Layer (`@ferdy/ui/styles.css`) — 단순 요소
> **"JS 로직이 거의 없고, 네이티브 HTML 태그 기능(폼, 접근성, `v-model`, 이벤트)이 중요한 요소"**

- **대상**: `Button`, `Badge`, `Card`, `Input`, `List` 등
- **방식**: `.fd-btn`, `.fd-badge`, `.fd-card`, `.fd-input` 등 표준 CSS 컴포넌트 클래스를 `@ferdy/ui/styles.css`에 포함하여 제공
- **장점**:
  - 각 프레임워크가 네이티브 `<button>`, `<input>`을 그대로 사용하므로 `form` 제출, `v-model`, `onClick`, `tabIndex`, 스크린리더 등 브라우저 기본 기능을 추가 보일러플레이트 없이 100% 활용
  - 디자인 토큰과 컴포넌트 외형은 `@ferdy/ui` 한 곳에서 통일 관리

### 2층: Web Component Layer (`Lit`) — 독립 위젯
> **"자체 상태와 인터랙션 로직이 풍부하여 프레임워크마다 재구현하기 비효율적인 독립 위젯"**

- **대상**:
  - **입력 위젯**: `<fd-text-field>`, `<fd-date-picker>` 등
  - **독립 시각화/미디어**: `<fd-chart>` (ECharts/Chart.js 등 래핑), `<fd-code-viewer>`
  - **완결형 데이터 위젯**: 데이터와 설정만 넘겨 동작하는 기본 `<fd-data-grid>`
- **프레임워크(FW) 개별 구현으로 남기는 영역**:
  - **Form 전체 상태 오케스트레이션** (React Hook Form, Vue `v-model` + 폼 검증 흐름 등)
  - **Scoped Slot / Render Prop이 핵심인 컨테이너** (셀 내부에 부모 프레임워크의 커스텀 컴포넌트를 렌더링해야 하는 복잡한 Grid/List)
  - **입력 Masking** 등 프레임워크 제어 상태(`value`)·한글 IME 조합 타이밍과 민감하게 충돌하는 확장 기능

---

## 3. `Lit` 기반 Web Component 도입 시 고려사항 및 대응 방안

| 항목 | 원인 / 현상 | `Lit` 기반 대응 전략 |
| :--- | :--- | :--- |
| **전역 CSS 클래스 미침투** | CSS 변수(`--fd-*`)는 Shadow DOM을 통과하지만, `.icon-*` 같은 전역 CSS 클래스는 Shadow DOM 내부로 전달되지 않음 | ① 아이콘을 인라인 `<svg>`로 직접 렌더링하거나<br>② `static styles` / `adoptedStyleSheets`로 스타일 주입, 또는<br>③ Named Slot(`<i slot="left-icon">`)으로 외부 DOM 투영 활용 |
| **Attribute vs Property** | HTML attribute는 문자열만 전달 가능. 객체/배열/함수는 DOM Property로 전달 필요 | `@property({ type: ... })` 또는 `static properties` 선언을 통해 Attribute↔Property 변환 규칙 명시, Lit 템플릿(`.prop=${...}`) 및 React 19 / Vue 3 Property 바인딩 검증 |
| **Slot vs Scoped Slot** | 일반 `<slot>`, Named Slot(`v-if` 포함)은 정상 동작하나, 내부 데이터를 부모 템플릿으로 역류시키는 Scoped Slot은 프레임워크 경계상 어려움 | 일반/Named Slot 위주로 설계하고, Scoped Slot이 필수적인 복합 컨테이너는 각 FW 영역으로 분리 |
| **포커스 및 `tabIndex`** | Shadow DOM 내부 `<input>`에 외부 `<label>`이나 `el.focus()`가 닿지 않거나 내부 버튼이 Tab 순서를 방해함 | `static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }` 적용 및 내부 보조 버튼(예: Clear 버튼)에 `tabindex="-1"` 부여 |
| **Form 연동** | 커스텀 태그가 네이티브 `<form>`의 `submit`/`reset`/유효성 검사에 자동 참여하지 않음 | 필요 시 `static formAssociated = true` + `attachInternals()` 연동 또는 `el.validate()` 메서드 노출 |
| **TypeScript JSX 타입** | `<fd-*>` 태그에 대한 에디터 자동완성 및 타입 체크 누락 | React, Vue, SolidJS 각각의 전역 JSX/템플릿 타입 선언(`.d.ts`) 별도 제공 |
| **Overlay / Portal** | 모달·드롭다운 등이 `document.body`로 포털 이동 시 Shadow DOM 및 `--fd-*` 스코프 이탈 주의 | 테마 변수 상속 루트 유지 및 `z-index` 스태킹 컨텍스트 규칙 정리 |
| **데코레이터 & Class Field Shadowing** | TypeScript `target: ESNext`의 기본값(`useDefineForClassFields: true`) 사용 시 클래스 필드 초기화가 `Lit`의 `@property` 반응형 getter/setter를 덮어써서 리렌더링이 동작하지 않음 | 모노레포 최상위 공통 설정인 `@ferdy/tsconfig/base.json`에 `"experimentalDecorators": true`, `"useDefineForClassFields": false`를 명시하여 모든 서브 프로젝트(Solid/React/Vue) 번들링 시 동일한 변환 보장 |

---

## 4. 레퍼런스 스펙: `Input` vs `TextField` 분리 모델

첫 번째 `Lit` 기반 Web Component PoC 모델로 `TextField`를 선정하여 아래와 같이 역할을 나눕니다.

- **`Input` (`.fd-input` — CSS Class)**
  - 순수 `<input>` 스타일(`variant`, `size`, 포커스 링, 비활성 스타일)만 담당
- **`<fd-text-field>` (Web Component — `LitElement`)**
  - 문자열 입력에 특화된 독립 입력 위젯
  - **주요 기능 범위**:
    - 입력 시작 시 우측 지우기(`X`) 버튼 자동 노출 및 클릭 시 값 초기화 + 포커스 복원 (`tabindex="-1"` 적용)
    - 좌측 / 우측 아이콘 지원 (Named Slot 또는 인라인 SVG)
    - 하단 헬퍼 메시지 영역: `info` (안내) / `pass` (성공) / `fail` (실패) 상태 표시
    - Rule 검증 지원: `instant` (입력 즉시) / `lazy` (blur 또는 외부 `validate()` 호출 시) 검증 및 에러 상태·메시지 표시
    - 다수 입력 필드 배치 시 `tabIndex` 및 `delegatesFocus: true` 정상 동작 보장
  - **제외 범위 (별도 확장)**:
    - `placeholder`는 기본 HTML 속성 위임
    - 앞/뒤 카테고리 Dropdown 결합 UI 제외
    - 입력 Masking 로직은 프레임워크 레벨 확장(`Extends`)으로 분리

---

## 5. 다음 마이너 버전 작업 TODO

> **v0.1.9 상세 실행 계획**: `<fd-select>`, `<fd-switch>`, `<fd-tabs>` 후보군 확장, `@ferdy/sample-components` 쇼케이스 앱 신설, 기존 도메인 앱(`task-react`, `task-vue`, `builtin-*`) 갱신까지 포함한 7단계 작업 목록은 [todo.currVer.md](./todo.currVer.md)에서 관리합니다.

- [ ] **1단계: `Lit` 패키지 및 엔트리 구조 PoC**
  - [ ] `@ferdy/ui`에 `lit` 의존성 추가 및 Web Component 엔트리(예: `@ferdy/ui/elements`) 설계
  - [ ] `tsconfig` 데코레이터 사용 여부 결정 (`@customElement` / `@property` vs 표준 `static properties` + `customElements.define`)
  - [ ] Core(SolidJS), `task-react`(React 19), `task-vue`(Vue 3) 모두에서 `<fd-*>` 태그가 Vite 빌드 충돌 없이 정상 렌더링되는지 PoC 검증 (`Vue`는 `isCustomElement: tag => tag.startsWith('fd-')` 설정 확인)
- [ ] **2단계: Style Layer(`.fd-*`) 정비**
  - [ ] 기존 `fdCompo.*.css`(`Button`, `Badge`, `Card`, `Input` 등)를 `@ferdy/ui/styles.css`에서도 일관되게 사용할 수 있도록 클래스 구조 정리
  - [ ] Shadow DOM 내부에서 사용할 아이콘 렌더링 방식 확정 (인라인 SVG vs Named Slot vs `adoptedStyleSheets`)
- [ ] **3단계: `<fd-text-field>` 프로토타입 구현 및 3종 프레임워크 테스트**
  - [ ] `LitElement` 기반으로 `delegatesFocus`, `tabIndex`, `clearable`, 좌/우 아이콘, `info`/`pass`/`fail` 메시지, Rule 검증(`instant`/`lazy`) 구현
  - [ ] SolidJS(Core/Sample), React 19(`task-react`), Vue 3(`task-vue`)에서 각각 양방향 바인딩(`v-model`, controlled `value`/`onInput`) 및 포커스/Tab 이동 동작 검증
- [ ] **4단계: TypeScript DX 정리**
  - [ ] React 19 / Vue 3 / SolidJS용 Custom Elements 타입 선언(`.d.ts`) 구성 (또는 Custom Elements Manifest 기반 자동 생성 검토)
- [ ] **5단계: 고복잡도 위젯 확장 검토**
  - [ ] `<fd-chart>` 또는 `<fd-date-picker>` 등 차기 Web Component 후보 선정 및 구현
