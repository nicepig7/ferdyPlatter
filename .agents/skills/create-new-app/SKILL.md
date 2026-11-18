---
name: create-new-app
description: >-
  Use this skill when the user asks to create, scaffold, or register a new isolated
  domain application under packages/domains/ in the Ferdy Platter (FerdyOS) monorepo.
---

# Create New Domain App in Ferdy Platter (`packages/domains/<category>/<app-name>`)

이 스킬은 `ferdy-platter` 모노레포의 **[D] Domains** 계층(`packages/domains/<category>/<app-name>`)에 새로운 격리형 Web OS 앱을 추가하고 Core(`@ferdy/core`)의 앱 메타데이터 레지스트리(`services/app/fdCore.app.manifest.meta.ts`)에 등록하는 표준 절차입니다.

---

## 1. 디렉토리 및 패키지 이름 규칙

- **카테고리 (`<category>`)**: 앱 성격에 따라 그룹 폴더를 선택합니다.
  - `builtin`: OS 기본 내장 앱 (`clock`, `calendar`, `notes` 등)
  - `sample`: 템플릿·예제·샌드박스 테스트 앱 (`app`, `hello` 등)
- **디렉토리 경로**: `packages/domains/<category>/<app-name>` (예: `packages/domains/builtin/notes`, `packages/domains/sample/app`)
- **패키지명 (`package.json`)**: `@ferdy/<category>-<app-name>` (예: `@ferdy/builtin-notes`, `@ferdy/sample-app`)
- **앱 고유 ID (`appId`)**: `'<category>-<app-name>'` (예: `'builtin-notes'`, `'sample-app'`)
- **서빙 URL**: `/domains/<category>/<app-name>/` (`packages/core/plugins/monorepoDomainsGateway.ts`가 `packages/domains/**`를 재귀 스캔하여 개발 서버 라우팅 및 프로덕션 빌드 엔트리에 등록함)

---

## 2. 필수 생성 파일 목록

새 앱 폴더(`packages/domains/<category>/<app-name>/`) 안에 다음 파일들을 생성합니다 (`packages/domains/sample/app/` 또는 `packages/domains/sample/hello/` 참고):

1. **`package.json`**:
   - `name`: `"@ferdy/<category>-<app-name>"`
   - `dependencies`: `"@ferdy/bridge": "*"`, `"@ferdy/ui": "*"`, `"solid-js": "^1.9.3"`
   - `devDependencies`: `"vite": "^6.0.1"`, `"vite-plugin-solid": "^2.11.0"`
   - `scripts`: `dev`, `build`, `preview`, `typecheck` (`tsc --noEmit`)
2. **`tsconfig.json`**:
   - `packages/domains/sample/app/tsconfig.json`과 동일한 설정(`"extends": "@ferdy/tsconfig/base.json"`)을 사용합니다.
3. **`vite.config.ts`**:
   - 단독 실행 및 빌드를 위한 기본 `vite-plugin-solid` 설정을 포함합니다.
4. **`index.html`**:
   - `<div id="root"></div>`와 `<script type="module" src="./src/main.tsx"></script>`를 포함합니다.
   - 기본 CSS Reset과 토큰은 `@ferdy/ui`에서 자동 주입되므로 별도의 인라인 리셋 `<style>`을 중복 작성할 필요가 없습니다.
   - **주의**: Core의 `monorepoDomainsGatewayPlugin`이 `./src/` 또는 `/src/` 경로를 자동 치환하므로 스크립트 경로는 반드시 `./src/...` 형태로 작성합니다.
5. **`src/main.tsx` 및 메인 화면 컴포넌트 (`src/app<Name>.tsx`, `src/app<Name>.css`)**:
   - 엔트리 파일(`src/main.tsx`)에서 `import '@ferdy/ui/styles.css';`를 호출하여 전역 디자인 토큰과 리셋을 주입하고, 루트 컴포넌트(`<App<Name> />`)를 마운트합니다.
   - `@ferdy/ui`의 컴포넌트(`fd.Button`, `fd.Badge`, `fd.Card`, `fd.Icon`) 및 CSS 변수(`var(--fd-*)`), 레이아웃 클래스(`.fd-app-shell`)를 사용하여 일관된 Look & Feel을 유지합니다.
   - 부모 Core와의 통신이 필요할 경우 `@ferdy/bridge`의 `ferdyBridge` (`ferdyBridge.openWindow`, `ferdyBridge.on`, `ferdyBridge.emit` 등)를 사용합니다.
6. **`README.md`**:
   - 해당 도메인 앱의 목적, 주요 기능, 디렉토리 구조, 사용하는 `@ferdy/bridge` 이벤트를 요약합니다.

---

## 3. Core 앱 매니페스트 및 바탕화면 바로가기 등록

도메인 앱 파일 생성이 끝나면, 목적에 따라 아래 독립 스킬을 조합하여 Core(`@ferdy/core`)에 등록합니다.

1. **Core 앱 매니페스트 및 아이콘 등록 (필수)**:
   - [manage-app-manifest](../manage-app-manifest/SKILL.md) 스킬의 절차에 따라 `fdCore.app.manifest.meta.ts`에 앱 매니페스트를 등록합니다.
2. **바탕화면 바로가기 등록 (선택/요청 시)**:
   - 바탕화면 아이콘 그리드 배치가 필요한 경우 [manage-desktop-shortcut](../manage-desktop-shortcut/SKILL.md) 스킬의 절차에 따라 `fdCore.app.shortcuts.meta.ts`에 바로가기를 추가합니다.

---

## 4. 검증 및 문서 업데이트

1. 루트에서 `npm install` (새 워크스페이스 심볼릭 링크 연결) 후 `npm run typecheck`를 실행하여 타입 에러가 없는지 확인합니다.
2. `README.md`, `docs/features.md`, `docs/releases/releases.md`(및 해당 마이너 버전 파일 `docs/releases/releases.<major>.<minor>.md`)에 새 앱 추가 내역을 반영합니다.
