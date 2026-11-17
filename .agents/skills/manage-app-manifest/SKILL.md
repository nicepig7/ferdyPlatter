---
name: manage-app-manifest
description: >-
  Use this skill when the user asks to register, update, or remove a Core app
  manifest (`fdRegist.apps.manifest.meta.ts`) or shared app icon assets
  (`packages/assets/src/index.ts`) in the Ferdy Platter (`@ferdy/core`) monorepo.
---

# Manage Core App Manifest & Icon Assets

이 스킬은 Ferdy Platter Core(`@ferdy/core`)의 앱 메타데이터 레지스트리에 설치된 앱의 고유 메타정보(`fdRegist.apps.manifest.meta.ts`)와 공용 아이콘 에셋(`@ferdy/assets`)을 등록·수정하는 절차입니다.

---

## 1. `.meta.ts` 관리 원칙

- `packages/core/src/services/app/` 하위의 메타데이터 파일은 반드시 `.meta.ts` 접미사를 사용하며, **한 파일에 한 종류의 데이터만 관리**합니다.
- **앱 고유 메타정보**(`fdRegist.apps.manifest.meta.ts`)와 **바탕화면 바로가기 목록**(`fdRegist.apps.shortcuts.meta.ts`)은 분리하여 관리합니다.

---

## 2. 공용 아이콘 상수 추가 (선택)

커스텀 SVG 아이콘이나 공용 아이콘 상수가 필요한 경우, `packages/assets/src/index.ts`의 `FERDY_ASSETS.icons`에 SVG 경로(`/assets/icons/...svg`) 또는 Lucide 아이콘 이름을 등록합니다.

---

## 3. 앱 매니페스트 등록/수정

`packages/core/src/services/app/fdRegist.apps.manifest.meta.ts`의 `INITIAL_APP_MANIFESTS` 배열에 앱의 고유 메타정보(`appId`, `title`, `icon`, `tone`, `appUrl`, `defaultWindow` 등)를 추가하거나 수정합니다.

```ts
{
  appId: 'app-notes',
  title: 'Notes',
  icon: 'notebook-pen',
  tone: 'primary',
  appUrl: '/apps/app-notes/',
  description: '마크다운 메모장 도메인 앱',
  defaultWindow: {
    width: 520,
    height: 400,
  },
}
```

- **`appUrl`**: 도메인 앱인 경우 반드시 `/apps/<app-name>/` 형식과 일치해야 합니다.

---

## 4. 검증

수정 후 루트에서 타입 체크를 실행하여 오류가 없는지 확인합니다.

```bash
npm run typecheck
```
