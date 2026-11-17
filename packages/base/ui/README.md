# @ferdy/ui (`packages/base/ui`)

**Ferdy Platter (FerdyOS)**의 **[B] Base** 계층에 속하는 **공통 디자인 시스템 및 SolidJS UI 컴포넌트 패키지**입니다.  
Core(`@ferdy/core`)와 `iframe`으로 격리된 모든 도메인 앱(`packages/domains/*`)에 단일한 Look & Feel(CSS 디자인 토큰, Base Reset, 공통 컴포넌트)을 제공합니다.

---

## 주요 구성 요소

1. **CSS Cascade Layers (`src/styles/index.css` & `fdStyle.*.css`)**:
   - `@layer reset, tokens, theme, libraries, base, layout, components, utilities;` 순서로 명시적 우선순위 계층을 구성합니다.
   - `index.css`를 제외한 모든 스타일 파일은 `fdStyle.<layer>.css` 네이밍 규칙을 따릅니다:
     - `fdStyle.reset.css` (`@layer reset`): `*, *::before, *::after` 박스 모델 및 마진/패딩 초기화
     - `fdStyle.tokens.css` (`@layer tokens`): 테마와 무관한 공통 수치/폰트 토큰 (`--fd-radius-*`, `--fd-font-sans`: `Pretendard Variable`, `--fd-font-mono`: `D2Coding`)
     - `fdStyle.theme.css` (`@layer theme`): 테마별 시맨틱 컬러/표면 토큰 정의 (Primary: 빈티지 오렌지 브라운 `--fd-primary*`, Secondary: 포레스트 그린 `--fd-secondary*`, Surface/Text: `--fd-bg-*`, `--fd-text-*`)
     - `fdStyle.libraries.css` (`@layer libraries`): 외부 오픈소스/서드파티 CSS 및 웹폰트(`Pretendard Variable`, `D2Coding`, `lucide-static`)를 `layer(libraries)`로 래핑하여 로드 (`base`, `components`보다 낮은 우선순위 보장)
     - `fdStyle.base.css` (`@layer base`): `html, body, #root`, `code` 등 기본 요소 스타일
     - `fdStyle.layout.css` (`@layer layout`): `.fd-app-shell`, `.fd-app-header`, `.fd-app-title` 등 도메인 앱 표준 레이아웃 헬퍼
     - `fdStyle.components.css` (`@layer components`): 모든 UI 컴포넌트가 공통으로 공유하는 베이스 규칙(`:focus-visible`, `:disabled`, 기본 폰트/박스 모델)
     - `fdStyle.utilities.css` (`@layer utilities`): 최상위 우선순위 유틸리티 클래스 영역
2. **SolidJS UI Primitives (`src/components/<name>/fdCompo.<name>.tsx` & `.css`)**:
   - 각 컴포넌트는 `src/components/<name>/` 하위 폴더에 격리되며, `fdCompo.<name>.tsx`와 전용 스타일 `fdCompo.<name>.css` (`@layer components`)가 한 쌍으로 배치됩니다:
     - `components/button/` (`fdCompo.button.tsx`, `fdCompo.button.css`)
     - `components/badge/` (`fdCompo.badge.tsx`, `fdCompo.badge.css`)
     - `components/card/` (`fdCompo.card.tsx`, `fdCompo.card.css`)
     - `components/icon/` (`fdCompo.icon.tsx`, `fdCompo.icon.css`)
   - 소문자 `fd` 네임스페이스(`<fd.Button>`, `<fd.Badge>`, `<fd.Card>`, `<fd.Icon>`)와 개별 컴포넌트(`<FdButton>` / `<Button>`, `<FdBadge>` / `<Badge>`, `<FdCard>` / `<Card>`, `<FdIcon>` / `<Icon>`)를 모두 지원합니다.
   - `fd.Button` (`FdButton` / `Button`): `variant` (`primary`, `secondary`, `neutral`, `accent-ghost`, `secondary-ghost`, `purple`, `danger`), `size` (`sm`, `md`) 지원
   - `fd.Badge` (`FdBadge` / `Badge`): `variant` (`primary`, `secondary`, `accent`, `neutral`, `purple`) 캡슐형 상태 배지
   - `fd.Card` (`FdCard` / `Card`): 반투명 서피스 패널 컨테이너
   - `fd.Icon` (`FdIcon` / `Icon`): `lucide-static` 웹폰트 기반 아이콘 컴포넌트 (`name`, `size`: `'inherit' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number`, `spin`, `label`)

---

## 사용 예시

`@ferdy/ui`를 import하면 공통 CSS 토큰과 Base 스타일이 자동으로 주입됩니다.

```tsx
import { fd, FdButton, Button } from '@ferdy/ui';

export const MyApp = () => (
  <div class="fd-app-shell">
    <header class="fd-app-header">
      <h2 class="fd-app-title">My Domain App</h2>
      <fd.Badge variant="accent">iframe sandboxed</fd.Badge>
    </header>
    <fd.Card>
      <fd.Button variant="primary" onClick={() => console.log('Clicked')}>
        Action (fd.Button)
      </fd.Button>
      {/* <FdButton> 또는 <Button> 별칭도 동일하게 사용 가능 */}
    </fd.Card>
  </div>
);
```
