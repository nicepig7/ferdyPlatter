# @ferdy/ui (`packages/base/ui`)

**Ferdy Platter (FerdyOS)**의 **[B] Base** 계층에 속하는 **공통 디자인 시스템 및 SolidJS UI 컴포넌트 패키지**입니다.  
Core(`@ferdy/core`)와 `iframe`으로 격리된 모든 도메인 앱(`packages/domains/*`)에 일관된 Look & Feel(CSS Cascade Layers, 디자인 토큰, Base Reset, 공통 컴포넌트)을 제공합니다.

---

## 패키지 진입점 (Exports)

- `@ferdy/ui` (`./src/index.ts`): 공통 스타일(`styles/index.css`, `components/fdCompo.style.css`)과 모든 UI 컴포넌트(`fd.*` 네임스페이스 및 개별 컴포넌트/타입)를 함께 export합니다.
- `@ferdy/ui/styles.css` (`./src/styles/index.css`): SolidJS 컴포넌트 없이 CSS 계층과 디자인 토큰만 주입하고 싶을 때 사용합니다.

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
  - Typography (`--fd-font-sans`: `Pretendard Variable`, `--fd-font-mono`: `D2Coding`)
  - Motion / Transition (`--fd-duration-fast`, `--fd-duration-normal`, `--fd-ease-default`)
- `fdStyle.theme.css` (`@layer theme`): `:root, [data-theme='dark']` 시맨틱 토큰 정의
  - Surface & Elevation (`--fd-bg-*`, `--fd-bg-glass`, `--fd-bg-window`, `--fd-shadow-window*`)
  - Text / Ink (`--fd-text-*`)
  - Border / Divider (`--fd-border-subtle`, `--fd-border-strong`)
  - Primary / Secondary / Danger (`--fd-primary*`, `--fd-secondary*`, `--fd-danger*`) 및 하위 호환 별칭(`--fd-accent*`, `--fd-purple*`)
- `fdStyle.libraries.css` (`@layer libraries`): 외부 웹폰트(`Pretendard Variable`, `D2Coding`) 및 `lucide-static/font/lucide.css`를 `layer(libraries)`로 래핑해 로드 (`base`, `components`보다 낮은 우선순위 보장)
- `fdStyle.base.css` (`@layer base`): `html, body, #root`, 인라인 `code` 및 `pre/kbd/samp`, `:focus-visible`, `::selection`, 스크롤바(`::-webkit-scrollbar*`) 기본 스타일

### 2. SolidJS UI Primitives (`src/components/`)

- `fdCompo.style.css` (`@layer components`): 모든 `.fd-compo` 컴포넌트가 공유하는 포커스(`:focus-visible`) 및 비활성화(`:disabled`, `[aria-disabled='true']`) 규칙
- 각 컴포넌트는 `src/components/<name>/` 폴더에 `fdCompo.<name>.tsx`와 전용 스타일 `fdCompo.<name>.css`(`@layer components`) 한 쌍으로 격리됩니다.
- 소문자 `fd` 네임스페이스(`<fd.Button>`, `<fd.Badge>`, `<fd.Card>`, `<fd.Icon>`)와 개별 컴포넌트/별칭(`<Button>` / `<FdButton>`, `<Badge>` / `<FdBadge>`, `<Card>` / `<FdCard>`, `<Icon>` / `<FdIcon>`)을 모두 지원합니다.
  - `components/button/`: `variant` (`primary`, `secondary`, `neutral`, `accent-ghost`, `secondary-ghost`, `purple`, `danger`), `size` (`sm`, `md`)
  - `components/badge/`: `variant` (`primary`, `secondary`, `accent`, `neutral`, `purple`) 캡슐형 상태 배지
  - `components/card/`: 반투명 서피스 패널 컨테이너
  - `components/icon/`: `lucide-static` 웹폰트 기반 아이콘 (`name`, `size`: `'inherit' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number`, `spin`, `label`)

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

스타일만 단독으로 불러올 때는 `@ferdy/ui/styles.css`를 import합니다.

```ts
import '@ferdy/ui/styles.css';
```

---

## 검증

```bash
npm run typecheck --workspace=@ferdy/ui
```
