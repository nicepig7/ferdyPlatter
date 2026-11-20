# @ferdy/ui (`packages/base/ui`)

**Ferdy Platter (FerdyOS)**의 **[B] Base** 계층에 속하는 **공통 디자인 시스템, 2층 하이브리드 UI(CSS Style Layer + Lit Web Components) 및 SolidJS UI 패키지**입니다.  
Core(`@ferdy/core`)와 `iframe`으로 격리된 모든 도메인 앱(`packages/domains/**`, SolidJS · React 19 · Vue 3)에 일관된 Look & Feel(CSS Cascade Layers, 디자인 토큰, Base Reset, 프레임워크 중립 Web Components, 공통 SolidJS 컴포넌트)을 제공합니다.

---

## 패키지 진입점 (Exports)

- `@ferdy/ui` (`./src/index.ts`): 공통 스타일(`styles/index.css`, `components/fdCompo.style.css`)과 SolidJS UI 컴포넌트(`fd.*` 네임스페이스 및 개별 컴포넌트/타입)를 함께 export합니다.
- `@ferdy/ui/styles.css` (`./src/styles/index.css`): **1층 Style Layer** — CSS `@layer` 계층, 디자인 토큰(`--fd-*`), 및 프레임워크 중립 CSS 컴포넌트 클래스(`.fd-btn`, `.fd-badge`, `.fd-card`, `.fd-input`)를 로드합니다.
- `@ferdy/ui/elements` (`./src/elements/index.ts`): **2층 Web Component Layer** — `Lit` 기반 커스텀 엘리먼트(`<fd-text-field>`, `<fd-select>`, `<fd-switch>`, `<fd-tabs>`) 및 SolidJS / React 19 / Vue 3 공통 JSX·템플릿 타입 선언(`fdElem.jsx.d.ts`)을 등록·export합니다.

---

## 주요 구성 요소

### 1. CSS Cascade Layers (`src/styles/index.css` & `fdStyle.*.css`)

`src/styles/index.css`에서 아래 순서로 명시적 `@layer` 우선순위 계층을 선언하고 import합니다.

```css
@layer reset, tokens, theme, libraries, base, components;
```

- `fdStyle.reset.css` (`@layer reset`): 박스 모델(`box-sizing: border-box`), 타이포그래피·리스트·링크·미디어·폼 컨트롤·테이블 초기화
- `fdStyle.token.css` (`@layer tokens`): 테마와 무관한 원시 값 토큰 정의
  - Color Palette Primitives (`--fd-palette-*`, `--fd-rgb-*`: Espresso, Cream/Sand, Terracotta, Forest/Mint, Crimson/Rose)
  - Radius Scale (`--fd-radius-xs`, `sm`, `md`, `lg`, `pill`)
  - Control Size (`--fd-control-height-sm: 30px`, `--fd-control-height-md: 36px`)
  - Typography (`--fd-font-sans`: `Pretendard Variable`, `--fd-font-mono`: `D2Coding`, `--fd-text-xs` `12px` ~ `--fd-text-2xl` `24px` 짝수 스케일 토큰)
  - Motion / Transition (`--fd-duration-fast`, `--fd-duration-normal`, `--fd-ease-default`)
- `fdStyle.theme.css` (`@layer theme`): `:root, [data-theme='dark']` 시맨틱 토큰 정의
  - Surface & Elevation (`--fd-bg-*`, `--fd-bg-glass`, `--fd-bg-window`, `--fd-shadow-window*`)
  - Text / Ink (`--fd-text-*`)
  - Border / Divider (`--fd-border-subtle`, `--fd-border-strong`)
  - Primary / Secondary / Danger (`--fd-primary*`, `--fd-secondary*`, `--fd-danger*`) 및 하위 호환 별칭(`--fd-accent*`, `--fd-purple*`)
- `fdStyle.libraries.css` (`@layer libraries`): 외부 웹폰트(`Pretendard Variable`, `D2Coding`) 및 `lucide-static/font/lucide.css`를 `layer(libraries)`로 래핑해 로드 (`base`, `components`보다 낮은 우선순위 보장)
- `fdStyle.base.css` (`@layer base`): `html, body, #root`, 인라인 `code` 및 `pre/kbd/samp`, `:focus-visible`, `::selection`, 스크롤바(`::-webkit-scrollbar*`) 기본 스타일

### 2. 1층 Style Layer (`.fd-*` CSS 컴포넌트 클래스)

`styles/index.css`는 `fdCompo.style.css`, `button`, `badge`, `card`, `input` CSS를 `@layer components`에 함께 포함하여 비-Solid 앱(`@ferdy/ui/styles.css` 단독 로드)에서도 `.fd-btn`, `.fd-badge`, `.fd-card`, `.fd-input` 및 `--variant` / `--size` 모디파이어를 그대로 사용할 수 있습니다.

### 3. 2층 Web Components (`src/elements/` — `Lit`)

프레임워크와 무관하게 동일한 상태·접근성·인터랙션을 제공하는 `LitElement` 기반 커스텀 엘리먼트(`fdElem.<name>.ts`)입니다.
- `common/fdElem.icon.ts`: `lucide-static` 아이콘을 Shadow DOM 내부에 인라인 `<svg>`로 렌더링하는 헬퍼 (`registerFdIcons`, `renderFdIcon`, `renderFdIconSlot`)
- `text-field/fdElem.textField.ts` (`<fd-text-field>`): `delegatesFocus`, `clearable` 지우기 버튼, 좌/우 아이콘(`left-icon`, `right-icon` 및 Named Slot), `status` (`info`/`pass`/`fail`) 헬퍼 메시지, `instant`/`lazy` Rule 검증(`validate()`, `resetValidation()`)
- `select/fdElem.select.ts` (`<fd-select>`): 커스텀 드롭다운, 키보드 탐색(`ArrowUp`/`ArrowDown`/`Home`/`End`/`Enter`/`Escape`), 외부 클릭 닫기
- `switch/fdElem.switch.ts` (`<fd-switch>`): `role="switch"`, `sm`/`md` 토글 스위치, `Space`/`Enter` 지원
- `tabs/fdElem.tabs.ts` (`<fd-tabs>`): `pill`/`underline`/`segmented` 변형, `count`/`icon` 배지, 좌우 방향키 탭 전환
- `fdElem.jsx.d.ts`: `HTMLElementTagNameMap`, React 19 `JSX.IntrinsicElements`, Vue 3 `GlobalComponents`, SolidJS `JSX.IntrinsicElements` 타입 선언

### 4. SolidJS UI Primitives (`src/components/`)

- `fdCompo.style.css` (`@layer components`): 모든 `.fd-compo` 컴포넌트가 공유하는 포커스(`:focus-visible`) 및 비활성화(`:disabled`, `[aria-disabled='true']`) 규칙
- 각 컴포넌트는 `src/components/<name>/` 폴더에 `fdCompo.<name>.tsx`와 전용 스타일 `fdCompo.<name>.css`(`@layer components`) 한 쌍으로 격리됩니다.
- 소문자 `fd` 네임스페이스(`<fd.Button>`, `<fd.Badge>`, `<fd.Card>`, `<fd.Icon>`, `<fd.Input>`, `<fd.TextField>`)와 개별 컴포넌트/별칭(`<Button>` / `<FdButton>`, `<Badge>` / `<FdBadge>`, `<Card>` / `<FdCard>`, `<Icon>` / `<FdIcon>`, `<Input>` / `<FdInput>`, `<TextField>` / `<FdTextField>`)을 모두 지원합니다.
  - `components/button/`: `variant` (`primary`, `secondary`, `neutral`, `accent-ghost`, `secondary-ghost`, `purple`, `danger`), `size` (`sm`, `md`)
  - `components/badge/`: `variant` (`primary`, `secondary`, `accent`, `neutral`, `purple`) 캡슐형 상태 배지
  - `components/card/`: 반투명 서피스 패널 컨테이너
  - `components/icon/`: `lucide-static` 웹폰트 기반 아이콘 (`name`, `size`: `'inherit' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number`, `spin`, `label`)
  - `components/input/`: `variant` (`default`, `ghost`), `size` (`sm`, `md`) 기본 텍스트 입력 필드 (`InputProps` / `FdInputProps`)
  - `components/text-field/`: 좌측 아이콘(`leftIcon`), 지우기 버튼(`clearable`, `clearLabel`, `onClear`), 크기(`sm`, `md`)를 제공하는 복합 입력 필드 (`TextFieldProps` / `FdTextFieldProps`)

---

## 사용 예시

`@ferdy/ui`를 import하면 공통 CSS 토큰과 Base 스타일이 자동으로 주입됩니다.

```tsx
import { fd, FdButton, Button } from '@ferdy/ui';

export const MyApp = () => (
  <main>
    <header>
      <h2>My Domain App</h2>
      <fd.Badge variant="accent">iframe sandboxed</fd.Badge>
    </header>
    <fd.Card>
      <fd.Button variant="primary" onClick={() => console.log('Clicked')}>
        <fd.Icon name="sparkles" size="sm" />
        Action (fd.Button)
      </fd.Button>
      {/* <FdButton> 또는 <Button> 별칭도 동일하게 사용 가능 */}
    </fd.Card>
  </main>
);
```

멀티 프레임워크 도메인 앱(React 19, Vue 3 등)에서는 1층 스타일과 2층 Web Components를 함께 로드합니다.

```ts
import '@ferdy/ui/styles.css';
import '@ferdy/ui/elements';
```

---

## 검증

```bash
npm run typecheck --workspace=@ferdy/ui
```
