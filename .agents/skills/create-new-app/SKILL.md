---
name: create-new-app
description: >-
  Use this skill when the user asks to create, scaffold, or register a new isolated
  application under packages/apps/ in the Ferdy Platter (FerdyOS) monorepo.
---

# Create New App in Ferdy Platter (`packages/apps/<app-name>`)

이 스킬은 `ferdy-platter` 모노레포에 새로운 격리형 Web OS 앱(`packages/apps/<app-name>`)을 추가하고 Shell에 연결하는 표준 절차입니다.

---

## 1. 디렉토리 및 패키지 이름 규칙

- **디렉토리 경로**: `packages/apps/<app-name>` (예: `packages/apps/app-notes`)
- **패키지명 (`package.json`)**: `@ferdy/<app-name>` (예: `@ferdy/app-notes`)
- **서빙 URL**: `/apps/<app-name>/` (`packages/shell/vite.config.ts`가 자동으로 스캔하여 개발 서버 라우팅 및 프로덕션 빌드 엔트리에 등록함)

---

## 2. 필수 생성 파일 목록

새 앱 폴더(`packages/apps/<app-name>/`) 안에 다음 파일들을 생성합니다 (`packages/apps/app-sample/` 참고):

1. **`package.json`**:
   - `name`: `"@ferdy/<app-name>"`
   - `dependencies`: `"solid-js": "^1.9.3"`
   - `devDependencies`: `"vite": "^6.0.1"`, `"vite-plugin-solid": "^2.11.0"`
   - `scripts`: `dev`, `build`, `preview`, `typecheck` (`tsc --noEmit`)
2. **`tsconfig.json`**:
   - `packages/apps/app-sample/tsconfig.json`과 동일한 SolidJS JSX 설정(`"jsx": "preserve"`, `"jsxImportSource": "solid-js"`)을 사용합니다.
3. **`vite.config.ts`**:
   - 단독 실행 및 빌드를 위한 기본 `vite-plugin-solid` 설정을 포함합니다.
4. **`index.html`**:
   - `<div id="root"></div>`와 `<script type="module" src="./src/index.tsx"></script>`를 포함합니다.
   - **주의**: Shell의 `monorepoAppsGatewayPlugin`이 `./src/` 또는 `/src/` 경로를 `/@fs/.../src/`로 자동 치환하므로 스크립트 경로는 반드시 `./src/index.tsx` 형태로 작성합니다.
5. **`src/index.tsx` 및 `src/App.tsx`**:
   - SolidJS 컴포넌트로 작성하며, 부모 Shell과의 통신이 필요할 경우 `window.parent.postMessage({ type: 'FERDY_...', ... }, '*')`를 사용합니다.
6. **`README.md`**:
   - 해당 앱의 목적, 주요 기능, 사용하는 `postMessage` 이벤트를 요약합니다.

---

## 3. Shell 데스크탑 바로가기 등록 (선택/요청 시)

사용자가 바탕화면 아이콘이나 런처에서 바로 실행하기를 원한다면:
- `packages/shell/src/components/Desktop.tsx`의 `SHORTCUTS` 배열에 새 앱 항목(`id`, `title`, `icon`, `appUrl: '/apps/<app-name>/'`)을 추가합니다.

---

## 4. 검증 및 문서 업데이트

1. 루트에서 `npm run typecheck`를 실행하여 새 앱과 Shell 모두 타입 에러가 없는지 확인합니다.
2. `docs/features.md` 및 `docs/releases.md`에 새 앱 추가 내역을 반영합니다.

