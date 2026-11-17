# @ferdy/assets (`packages/assets`)

**Ferdy Platter (FerdyOS)**의 **[A] Assets** 계층 패키지입니다.  
Core(`@ferdy/core`)와 모든 개별 도메인 앱(`packages/domains/*`)이 공통으로 참조하는 정적 리소스(아이콘, 로고 SVG, 폰트, 배경 이미지 등)와 에셋 경로 상수를 관리합니다.

---

## 디렉토리 구조

```text
packages/assets/
├── package.json
├── tsconfig.json
├── public/
│   └── assets/
│       ├── ferdy-logo.svg        # 단일 서버의 /assets/ferdy-logo.svg 경로로 서빙됨
│       └── icons/
│           └── app-sample.svg    # Sample App 전용 커스텀 SVG 아이콘 (/assets/icons/app-sample.svg)
└── src/
    └── index.ts                  # 에셋 경로 및 공통 아이콘 상수 (FERDY_ASSETS)
```

---

## 사용 방법

1. **정적 파일 URL 참조**:
   `packages/assets/public/assets/`에 위치한 파일은 `@ferdy/core`의 Vite `publicDir` 설정에 의해 `/assets/<파일명>`으로 서빙됩니다.
2. **타입 상수 참조**:
   ```ts
   import { FERDY_ASSETS } from '@ferdy/assets';
   ```
