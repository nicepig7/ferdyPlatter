# @ferdy/ui (`packages/base/ui`)

**Ferdy Platter (FerdyOS)**의 **[B] Base** 계층에 속하는 **공통 디자인 시스템 및 SolidJS UI 컴포넌트 패키지**입니다.  
Core(`@ferdy/core`)와 `iframe`으로 격리된 모든 도메인 앱(`packages/domains/*`)에 단일한 Look & Feel(CSS 디자인 토큰, Base Reset, 공통 컴포넌트)을 제공합니다.

---

## 주요 구성 요소

1. **Design Tokens (`src/styles/tokens.css`)**:
   - `--ferdy-bg-*`, `--ferdy-text-*`, `--ferdy-accent*`, `--ferdy-border-*`, `--ferdy-radius-*`, `--ferdy-font-sans` 등 OS 전역 시맨틱 CSS 변수 정의
2. **Base & Utility Styles (`src/styles/base.css`)**:
   - `*, *::before, *::after` 박스 모델 리셋 및 `html, body, #root` 기본 타이포그래피/배경 설정
   - `.f-app-shell`, `.f-app-header`, `.f-app-title` 등 도메인 앱 표준 레이아웃 클래스 제공
3. **SolidJS UI Primitives (`src/components/`)**:
   - `<Button>`: `variant` (`primary`, `secondary`, `accent-ghost`, `purple`, `danger`), `size` (`sm`, `md`) 지원
   - `<Badge>`: `variant` (`accent`, `neutral`, `purple`) 캡슐형 상태 배지
   - `<Card>`: 반투명 서피스 패널 컨테이너

---

## 사용 예시

`@ferdy/ui`를 import하면 공통 CSS 토큰과 Base 스타일이 자동으로 주입됩니다.

```tsx
import { Button, Badge, Card } from '@ferdy/ui';

export const MyApp = () => (
  <div class="f-app-shell">
    <header class="f-app-header">
      <h2 class="f-app-title">My Domain App</h2>
      <Badge variant="accent">iframe sandboxed</Badge>
    </header>
    <Card>
      <Button variant="primary" onClick={() => console.log('Clicked')}>
        Action
      </Button>
    </Card>
  </div>
);
```
