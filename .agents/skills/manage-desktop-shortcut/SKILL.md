---
name: manage-desktop-shortcut
description: >-
  Use this skill when the user asks to add, edit, override, or remove desktop
  shortcut icons (`fdCore.app.shortcuts.meta.ts`) on the FerdyOS desktop.
---

# Manage Desktop Shortcuts (`fdCore.app.shortcuts.meta.ts`)

이 스킬은 FerdyOS 바탕화면 아이콘 그리드에 표시되는 바로가기 목록(`INITIAL_DESKTOP_SHORTCUTS`)을 등록하거나 수정하는 절차입니다.

---

## 1. 바로가기 등록 및 상속 규칙

- 대상 파일: `packages/core/src/services/app/fdCore.app.shortcuts.meta.ts`
- `INITIAL_DESKTOP_SHORTCUTS` 배열에 고유 `id`와 대상 `appId`를 추가합니다.
- 기본 메타정보(`title`, `icon` 등)는 `appId`를 통해 `fdCore.app.manifest.meta.ts`의 매니페스트에서 **자동 상속**됩니다.

```ts
{
  id: 'notes-app-1',
  appId: 'app-notes',
}
```

---

## 2. 인스턴스 및 속성 오버라이드 (선택)

특정 인스턴스 파라미터를 전달하거나 바탕화면에서 다른 제목·아이콘·위치·크기를 원할 때만 다음 필드를 선택적으로 오버라이드합니다.

- `title`: 바탕화면에 표시할 별도 라벨
- `icon`: 별도 아이콘 지정
- `queryParams`: 앱에 전달할 쿼리 파라미터 (예: `{ instance: 2 }`)
- `x`, `y`: 바탕화면 그리드 좌표
- `width`, `height`: 해당 바로가기로 실행 시 기본 창 크기 오버라이드

---

## 3. 검증

수정 후 루트에서 타입 체크를 실행하여 오류가 없는지 확인합니다.

```bash
npm run typecheck
```
