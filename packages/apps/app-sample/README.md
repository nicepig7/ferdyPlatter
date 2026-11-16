# @ferdy/app-sample

**Ferdy Platter (FerdyOS)** 위에서 실행되는 격리된 샌드박스 앱의 **표준 레퍼런스(템플릿) 패키지**입니다.

새로운 앱을 `packages/apps/` 하위에 추가할 때 이 패키지의 구조와 통신 방식을 기준으로 삼을 수 있습니다.

---

## 주요 기능 및 시연 항목

1. **격리된 상태 관리 (Isolated State)**:
   - 각 창(`iframe`)마다 독립된 실행 컨텍스트와 SolidJS 시그널(`count`)을 가집니다.
   - URL 쿼리 파라미터(`?instance=1`, `?instance=2` 등)를 통해 서로 다른 인스턴스임을 식별합니다.
2. **Shell로의 단방향/양방향 통신 (`window.parent.postMessage`)**:
   - `FERDY_APP_PING`: 현재 앱 인스턴스 ID와 타임스탬프를 부모 Shell로 전송합니다.
   - `FERDY_OPEN_WINDOW`: 앱 내부에서 부모 Shell에게 새로운 앱 창을 띄워달라고 요청합니다.

---

## 디렉토리 구조

```text
packages/apps/app-sample/
├── index.html          # 앱 엔트리 HTML (/apps/app-sample/ 로 서빙됨)
├── package.json        # @ferdy/app-sample 패키지 정의
├── tsconfig.json       # TypeScript 설정
├── vite.config.ts      # 개별 앱 단독 실행/빌드용 Vite 설정
└── src/
    ├── index.tsx       # SolidJS render 마운트
    └── App.tsx         # 샘플 앱 UI 및 postMessage 발신 로직
```

---

## 실행 방법

### 1. FerdyOS Shell 내부에서 실행 (권장)
모노레포 루트에서 `npm run dev`를 실행하면 `http://localhost:3000`의 데스크탑 환경 안에서 `/apps/app-sample/` 경로로 자동 로드됩니다. 브라우저에서 `http://localhost:3000/apps/app-sample/`로 직접 접속해 단독 화면만 확인할 수도 있습니다.

### 2. 패키지 단독 타입 체크
```bash
npm run typecheck --workspace=@ferdy/app-sample
```

