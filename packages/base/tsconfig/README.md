# @ferdy/tsconfig (`packages/base/tsconfig`)

**Ferdy Platter (FerdyOS)**의 **[B] Base** 계층에 속하는 **워크스페이스 공통 TypeScript 설정 패키지**입니다.  
브라우저 환경용 기본 설정(SolidJS / React / Vue)과 Vite/Node 빌드 스크립트용 설정을 분리해 모든 패키지가 일관된 컴파일러 옵션을 공유하도록 합니다.

---

## 디렉토리 구조

```text
packages/base/tsconfig/
├── package.json        # @ferdy/tsconfig 패키지 및 exports 정의
├── base.json           # 브라우저 / SolidJS JSX 앱 공통 TypeScript 설정
├── react.json          # React JSX 앱용 TypeScript 설정 (base.json 확장)
├── vue.json            # Vue JSX/SFC 앱용 TypeScript 설정 (base.json 확장)
└── node.json           # Vite 설정 및 Node 스크립트용 composite TypeScript 설정
```

---

## 제공 설정 파일

1. **`@ferdy/tsconfig/base.json`**:
   - `target: "ESNext"`, `module: "ESNext"`, `moduleResolution: "bundler"`
   - `jsx: "preserve"`, `jsxImportSource: "solid-js"`, `types: ["vite/client"]`
   - `experimentalDecorators: true`, `useDefineForClassFields: false` (Lit Web Components 데코레이터 호환 및 Class Field Shadowing 방지)
   - `strict: true`, `isolatedModules: true`, `noEmit: true`
2. **`@ferdy/tsconfig/react.json`**:
   - `./base.json` 확장 후 `jsx: "react-jsx"`, `jsxImportSource: "react"`로 오버라이드
   - React 기반 도메인 앱(`@ferdy/work-task-react` 등)에서 사용
3. **`@ferdy/tsconfig/vue.json`**:
   - `./base.json` 확장 후 `jsx: "preserve"`, `jsxImportSource: "vue"`로 오버라이드
   - Vue 기반 도메인 앱(`@ferdy/work-task-vue` 등)에서 사용
4. **`@ferdy/tsconfig/node.json`**:
   - `composite: true`, `types: ["node"]`, `strict: true`, `isolatedModules: true`
   - 각 패키지의 `vite.config.ts` 또는 Node 기반 플러그인(`plugins/`) 타입 검사용으로 사용

---

## 사용 예시

### 브라우저 / SolidJS 패키지 (`tsconfig.json`)
```json
{
  "extends": "@ferdy/tsconfig/base.json",
  "include": ["src"],
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
```

### React / Vue 도메인 앱 (`tsconfig.json`)
```json
{
  "extends": "@ferdy/tsconfig/react.json", // Vue 앱은 "@ferdy/tsconfig/vue.json"
  "include": ["src"],
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
```

### Vite / Node 설정 (`tsconfig.node.json`)
```json
{
  "extends": "@ferdy/tsconfig/node.json",
  "include": ["vite.config.ts"]
}
```
