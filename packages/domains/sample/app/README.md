# @ferdy/sample-app (`packages/domains/sample/app`)

**Ferdy Platter (FerdyOS)**의 **[D] Domains (Sample)** 계층에서 실행되는 격리된 샌드박스 앱의 **표준 레퍼런스(템플릿) 패키지**입니다.

새로운 도메인 앱을 `packages/domains/<category>/<name>` 하위에 추가할 때 이 패키지의 구조와 `@ferdy/ui`, `@ferdy/bridge` 활용 방식을 기준으로 삼을 수 있습니다.

---

## 주요 기능 및 시연 항목

1. **격리된 상태 관리 (Isolated State)**:
   - 각 창(`iframe`)마다 독립된 실행 컨텍스트와 SolidJS 시그널(`count`)을 가집니다.
   - URL 쿼리 파라미터(`?instance=1`, `?instance=2` 등)를 통해 서로 다른 인스턴스임을 식별합니다.
2. **공통 디자인 시스템 (`@ferdy/ui`)**:
   - `<fd.Button>`, `<fd.Badge>`, `<fd.Icon>` 컴포넌트 및 `--fd-*` CSS 디자인 토큰을 사용하여 OS 전체와 통일된 Look & Feel을 유지합니다.
3. **타입 안전 브릿지 통신 (`@ferdy/bridge`)**:
   - `ferdyBridge.ping(instanceId)`: 현재 앱 인스턴스 ID와 타임스탬프를 부모 Core로 전송합니다.
   - `ferdyBridge.openWindow(...)`: 앱 내부에서 부모 Core에게 새로운 앱 창을 띄워달라고 요청합니다.

---

## 디렉토리 구조

```text
packages/domains/sample/app/
├── index.html          # 앱 엔트리 HTML (/domains/sample/app/ 로 서빙됨)
├── package.json        # @ferdy/sample-app 패키지 정의
├── tsconfig.json       # TypeScript 설정
├── tsconfig.node.json  # Vite 설정용 Node TypeScript 설정
├── vite.config.ts      # 개별 앱 단독 실행/빌드용 Vite 설정
└── src/
    ├── main.tsx        # SolidJS render 마운트 및 @ferdy/ui 스타일 주입
    ├── appSample.tsx   # 샘플 앱 UI (@ferdy/ui) 및 브릿지 발신 로직 (@ferdy/bridge)
    └── appSample.css   # 샘플 앱 레이아웃 및 토큰 기반 스타일
```

---

## 실행 방법

### 1. FerdyOS Core 내부에서 실행 (권장)
모노레포 루트에서 `npm run dev`를 실행하면 `http://localhost:3000`의 데스크탑 환경 안에서 `/domains/sample/app/` 경로로 자동 로드됩니다.

### 2. 패키지 단독 타입 체크
```bash
npm run typecheck --workspace=@ferdy/sample-app
```
