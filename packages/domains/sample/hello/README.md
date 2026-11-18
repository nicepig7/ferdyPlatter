# @ferdy/sample-hello (`packages/domains/sample/hello`)

**Ferdy Platter (FerdyOS)**의 **[D] Domains (Sample)** 계층에서 실행되는 최소 구성(Minimal) "Hello World" 도메인 앱 패키지입니다.

---

## 주요 목적

1. **최소 도메인 앱 구조 검증**:
   - `index.html` → `src/main.tsx` → `src/appHello.tsx`로 이어지는 가장 단순한 SolidJS 앱 마운트 흐름 확인
2. **공통 스타일시트 및 에셋 연동 (`@ferdy/ui`, `@ferdy/assets`)**:
   - `@ferdy/ui/styles.css`를 통한 OS 기본 리셋 및 디자인 토큰 적용
   - `@ferdy/assets`의 `FERDY_ASSETS.paths.logoSvg` (`/assets/logo/ferdy.svg`) 정적 에셋 참조 확인

---

## 디렉토리 구조

```text
packages/domains/sample/hello/
├── index.html          # 앱 엔트리 HTML (/domains/sample/hello/ 로 서빙됨)
├── package.json        # @ferdy/sample-hello 패키지 정의
├── tsconfig.json       # TypeScript 설정
├── tsconfig.node.json  # Vite 설정용 Node TypeScript 설정
├── vite.config.ts      # 개별 앱 단독 실행/빌드용 Vite 설정
└── src/
    ├── main.tsx        # SolidJS render 마운트
    ├── appHello.tsx    # Hello World 화면 컴포넌트
    └── appHello.css    # 컴포넌트 스타일
```

---

## 실행 방법

### 1. FerdyOS Core 내부에서 실행
모노레포 루트에서 `npm run dev`를 실행하면 바탕화면의 **Hello World** 바로가기 아이콘을 통해 `/domains/sample/hello/` 경로로 로드됩니다.

### 2. 패키지 단독 타입 체크
```bash
npm run typecheck --workspace=@ferdy/sample-hello
```
