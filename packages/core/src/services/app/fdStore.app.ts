import { createStore, produce } from 'solid-js/store';
import type {
  AppIconTone,
  AppManifest,
  DesktopShortcut,
  LaunchAppOptions,
} from '../../types/fdType.app';
import { windowStore } from '../window/fdStore.window';
import { INITIAL_APP_MANIFESTS } from './fdRegist.apps.manifest.meta';
import { INITIAL_DESKTOP_SHORTCUTS } from './fdRegist.apps.shortcuts.meta';

export interface ResolvedDesktopShortcut {
  id: string;
  appId?: string;
  title: string;
  icon: string;
  tone: AppIconTone;
  appUrl: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
}

interface AppStoreState {
  /** 설치/등록된 도메인 앱 매니페스트 맵 (key: appId) */
  apps: Record<string, AppManifest>;
  /** 바탕화면 바로가기 아이콘 목록 */
  shortcuts: DesktopShortcut[];
}

const initialAppsMap = INITIAL_APP_MANIFESTS.reduce<Record<string, AppManifest>>(
  (acc, manifest) => {
    acc[manifest.appId] = manifest;
    return acc;
  },
  {}
);

const [state, setState] = createStore<AppStoreState>({
  apps: initialAppsMap,
  shortcuts: [...INITIAL_DESKTOP_SHORTCUTS],
});

/**
 * 기본 URL에 쿼리 파라미터(`?key=value`)를 안전하게 결합합니다.
 */
function buildAppUrl(
  baseUrl: string,
  queryParams?: Record<string, string | number>
): string {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    searchParams.set(key, String(value));
  });

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${searchParams.toString()}`;
}

/**
 * 특정 `appId`의 매니페스트 정보를 조회합니다.
 */
export function getApp(appId: string): AppManifest | undefined {
  return state.apps[appId];
}

/**
 * 현재 등록된 모든 앱 매니페스트 목록을 배열로 반환합니다.
 */
export function getAppList(): AppManifest[] {
  return Object.values(state.apps);
}

/**
 * 런타임에 새로운 앱 매니페스트를 등록하거나 갱신합니다.
 */
export function registerApp(manifest: AppManifest): void {
  setState(
    produce((draft) => {
      draft.apps[manifest.appId] = manifest;
    })
  );
}

/**
 * 바탕화면 바로가기(Shortcut) 항목을 `AppManifest` 기본값과 병합하여 해석합니다.
 */
export function resolveShortcut(
  shortcut: DesktopShortcut
): ResolvedDesktopShortcut | null {
  const manifest = shortcut.appId ? state.apps[shortcut.appId] : undefined;
  const baseUrl = shortcut.appUrl ?? manifest?.appUrl;

  if (!baseUrl) {
    console.warn(
      `[appStore] Cannot resolve shortcut "${shortcut.id}": missing appUrl or valid appId.`
    );
    return null;
  }

  return {
    id: shortcut.id,
    appId: shortcut.appId ?? manifest?.appId,
    title: shortcut.title ?? manifest?.title ?? shortcut.id,
    icon: shortcut.icon ?? manifest?.icon ?? 'box',
    tone: shortcut.tone ?? manifest?.tone ?? 'neutral',
    appUrl: buildAppUrl(baseUrl, shortcut.queryParams),
    x: shortcut.x ?? manifest?.defaultWindow?.x,
    y: shortcut.y ?? manifest?.defaultWindow?.y,
    width: shortcut.width ?? manifest?.defaultWindow?.width,
    height: shortcut.height ?? manifest?.defaultWindow?.height,
    minWidth: shortcut.minWidth ?? manifest?.defaultWindow?.minWidth,
    minHeight: shortcut.minHeight ?? manifest?.defaultWindow?.minHeight,
  };
}

/**
 * 등록된 `appId`를 기반으로 앱 창을 실행합니다.
 * - 매니페스트의 기본 메타정보(`title`, `icon`, `appUrl`, `defaultWindow`)를 사용하되,
 *   `options`로 전달된 인스턴스 파라미터(`queryParams`), 창 ID, 좌표/크기 등을 오버라이드합니다.
 */
export function launchApp(appId: string, options?: LaunchAppOptions): void {
  const manifest = state.apps[appId];
  const baseUrl = options?.appUrl ?? manifest?.appUrl;

  if (!baseUrl) {
    console.warn(`[appStore] Unregistered appId "${appId}" and no fallback appUrl provided.`);
    return;
  }

  const finalUrl = buildAppUrl(baseUrl, options?.queryParams);

  windowStore.openWindow({
    id: options?.windowId ?? appId,
    appId: manifest?.appId ?? appId,
    title: options?.title ?? manifest?.title ?? appId,
    icon: options?.icon ?? manifest?.icon,
    appUrl: finalUrl,
    x: options?.x ?? manifest?.defaultWindow?.x,
    y: options?.y ?? manifest?.defaultWindow?.y,
    width: options?.width ?? manifest?.defaultWindow?.width,
    height: options?.height ?? manifest?.defaultWindow?.height,
    minWidth: options?.minWidth ?? manifest?.defaultWindow?.minWidth,
    minHeight: options?.minHeight ?? manifest?.defaultWindow?.minHeight,
  });
}

/**
 * 바탕화면 바로가기(Shortcut)를 실행합니다.
 */
export function openShortcut(shortcut: DesktopShortcut): void {
  const resolved = resolveShortcut(shortcut);
  if (!resolved) return;

  windowStore.openWindow({
    id: resolved.id,
    appId: resolved.appId,
    title: resolved.title,
    icon: resolved.icon,
    appUrl: resolved.appUrl,
    x: resolved.x,
    y: resolved.y,
    width: resolved.width,
    height: resolved.height,
    minWidth: resolved.minWidth,
    minHeight: resolved.minHeight,
  });
}

/**
 * 바탕화면에 새 바로가기를 동적으로 추가합니다.
 */
export function addShortcut(shortcut: DesktopShortcut): void {
  setState(
    produce((draft) => {
      const existingIdx = draft.shortcuts.findIndex((s) => s.id === shortcut.id);
      if (existingIdx >= 0) {
        draft.shortcuts[existingIdx] = shortcut;
      } else {
        draft.shortcuts.push(shortcut);
      }
    })
  );
}

export const appStore = {
  state,
  getApp,
  getAppList,
  registerApp,
  resolveShortcut,
  launchApp,
  openShortcut,
  addShortcut,
};
