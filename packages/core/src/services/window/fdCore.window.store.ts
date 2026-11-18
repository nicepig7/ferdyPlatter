import { createStore, produce } from 'solid-js/store';
import type {
  CreateWindowPayload,
  WindowInstance,
  WindowRestoreRect,
  WindowSnapZone,
} from '../../types/fdCore.window.type';

interface WindowStoreState {
  windows: WindowInstance[];
  activeWindowId: string | null;
  topZIndex: number;
  isInteracting: boolean;
  snapPreview: WindowSnapZone | null;
}

const BASE_Z_INDEX = 100;
export const WINDOW_TITLEBAR_HEIGHT = 38;
export const WINDOW_FRAME_BORDER = 2;
export const MIN_WINDOW_WIDTH = 320;
export const MIN_WINDOW_HEIGHT = 220;

const [state, setState] = createStore<WindowStoreState>({
  windows: [],
  activeWindowId: null,
  topZIndex: BASE_Z_INDEX,
  isInteracting: false,
  snapPreview: null,
});

/**
 * draft 내부에서 특정 창을 최상단 포커스 상태로 전환합니다.
 */
function focusWindowInDraft(draft: WindowStoreState, id: string): void {
  const target = draft.windows.find((w) => w.id === id);
  if (!target) return;

  const nextZ = draft.topZIndex + 1;
  draft.windows.forEach((w) => {
    if (w.id === id) {
      w.isFocused = true;
      w.isMinimized = false;
      w.zIndex = nextZ;
    } else {
      w.isFocused = false;
    }
  });
  draft.activeWindowId = id;
  draft.topZIndex = nextZ;
}

/**
 * draft 내부에서 현재 화면에 보이는(최소화되지 않은) 창 중 가장 높은 Z-Index 창으로 포커스를 이관합니다.
 */
function focusNextTopWindowInDraft(draft: WindowStoreState): void {
  const visibleWindows = draft.windows.filter((w) => !w.isMinimized);
  if (visibleWindows.length > 0) {
    const topWin = visibleWindows.reduce((prev, curr) =>
      curr.zIndex > prev.zIndex ? curr : prev
    );
    topWin.isFocused = true;
    draft.activeWindowId = topWin.id;
  } else {
    draft.activeWindowId = null;
  }
}

/**
 * 새로운 앱 창을 열거나, 이미 동일한 ID의 창이 있다면 포커스합니다.
 */
export function openWindow(payload: CreateWindowPayload) {
  const existing = state.windows.find((w) => w.id === payload.id);
  if (existing) {
    focusWindow(existing.id);
    return;
  }

  const nextZ = state.topZIndex + 1;
  const offset = (state.windows.length % 6) * 32;
  const id = payload.id ?? `win-${Date.now()}`;
  const minW = payload.minWidth ?? MIN_WINDOW_WIDTH;
  const minH = payload.minHeight ?? MIN_WINDOW_HEIGHT;

  setState(
    produce((draft) => {
      draft.windows.forEach((w) => {
        w.isFocused = false;
      });

      draft.windows.push({
        id,
        appId: payload.appId,
        title: payload.title,
        appUrl: payload.appUrl,
        icon: payload.icon,
        x: payload.x ?? 100 + offset,
        y: payload.y ?? 70 + offset,
        width: Math.max(minW, payload.width ?? 640),
        height: Math.max(minH, payload.height ?? 440),
        minWidth: payload.minWidth,
        minHeight: payload.minHeight,
        zIndex: nextZ,
        isFocused: true,
        isMinimized: false,
        isMaximized: false,
        snapZone: null,
        restoreRect: undefined,
      });

      draft.activeWindowId = id;
      draft.topZIndex = nextZ;
    })
  );
}

/**
 * 특정 창을 클릭하거나 활성화할 때 최상단(Z-index 갱신)으로 올리고 포커스 상태를 부여합니다.
 */
export function focusWindow(id: string) {
  if (!state.windows.some((w) => w.id === id)) return;

  setState(
    produce((draft) => {
      focusWindowInDraft(draft, id);
    })
  );
}

/**
 * 바탕화면/태스크바 등 창 외부 영역 클릭 시 모든 창의 포커스를 해제합니다.
 */
export function blurAllWindows() {
  if (!state.activeWindowId) return;

  setState(
    produce((draft) => {
      draft.windows.forEach((w) => {
        w.isFocused = false;
      });
      draft.activeWindowId = null;
    })
  );
}

/**
 * 창 닫기
 */
export function closeWindow(id: string) {
  setState(
    produce((draft) => {
      draft.windows = draft.windows.filter((w) => w.id !== id);

      if (draft.activeWindowId === id) {
        focusNextTopWindowInDraft(draft);
      }
    })
  );
}

/**
 * 창 최소화 (태스크바로 내리기)
 */
export function minimizeWindow(id: string) {
  setState(
    produce((draft) => {
      const target = draft.windows.find((w) => w.id === id);
      if (!target) return;

      target.isMinimized = true;
      target.isFocused = false;

      if (draft.activeWindowId === id) {
        focusNextTopWindowInDraft(draft);
      }
    })
  );
}

/**
 * 창 최대화 / 이전 크기 복원 토글
 */
export function toggleMaximizeWindow(id: string) {
  setState(
    produce((draft) => {
      const target = draft.windows.find((w) => w.id === id);
      if (!target) return;

      if (!target.isMaximized) {
        if (!target.restoreRect) {
          target.restoreRect = {
            x: target.x,
            y: target.y,
            width: target.width,
            height: target.height,
          };
        }
        target.isMaximized = true;
        target.snapZone = null;
      } else {
        target.isMaximized = false;
        target.snapZone = null;
        if (target.restoreRect) {
          target.x = target.restoreRect.x;
          target.y = target.restoreRect.y;
          target.width = target.restoreRect.width;
          target.height = target.restoreRect.height;
          target.restoreRect = undefined;
        }
      }

      focusWindowInDraft(draft, id);
    })
  );
}

/**
 * 태스크바 아이템 클릭 시 동작:
 * - 최소화 상태면 복원 + 포커스
 * - 이미 포커스된 최상단 창이면 최소화
 * - 열려있지만 비활성 창이면 최상단으로 포커스
 */
export function toggleTaskbarWindow(id: string) {
  const target = state.windows.find((w) => w.id === id);
  if (!target) return;

  if (target.isMinimized) {
    focusWindow(id);
  } else if (target.isFocused) {
    minimizeWindow(id);
  } else {
    focusWindow(id);
  }
}

/**
 * 드래그 이동 시 X, Y 좌표 실시간 업데이트 (Fine-grained reactivity)
 */
export function moveWindow(id: string, x: number, y: number) {
  setState(
    'windows',
    (w) => w.id === id,
    produce((w) => {
      w.x = Math.max(0, x);
      w.y = Math.max(0, y);
    })
  );
}

/**
 * 리사이징 핸들 조작 시 너비/높이(및 필요 시 X, Y 좌표) 실시간 업데이트
 */
export function resizeWindow(
  id: string,
  rect: { x?: number; y?: number; width: number; height: number }
) {
  setState(
    'windows',
    (w) => w.id === id,
    produce((w) => {
      const minW = w.minWidth ?? MIN_WINDOW_WIDTH;
      const minH = w.minHeight ?? MIN_WINDOW_HEIGHT;
      w.width = Math.max(minW, rect.width);
      w.height = Math.max(minH, rect.height);
      if (rect.x !== undefined) w.x = rect.x;
      if (rect.y !== undefined) w.y = rect.y;
      w.snapZone = null;
      w.restoreRect = undefined;
    })
  );
}

/**
 * 창 드래그/리사이즈 등 전역 포인터 인터랙션 진행 여부를 설정합니다.
 */
export function setInteracting(interacting: boolean) {
  setState(
    produce((draft) => {
      draft.isInteracting = interacting;
      if (!interacting) {
        draft.snapPreview = null;
      }
    })
  );
}

/**
 * 드래그 중 창 스냅 프리뷰 영역을 설정합니다.
 */
export function setSnapPreview(zone: WindowSnapZone | null) {
  if (state.snapPreview === zone) return;
  setState('snapPreview', zone);
}

/**
 * 좌/우 스냅 영역에 맞는 창 좌표와 크기를 계산합니다.
 */
function computeSnapRect(
  zone: 'left' | 'right',
  viewportWidth: number,
  viewportHeight: number,
  minWidth: number,
  minHeight: number
): WindowRestoreRect {
  const halfW = Math.round(viewportWidth / 2);
  if (zone === 'left') {
    return {
      x: 0,
      y: 0,
      width: Math.max(minWidth, halfW),
      height: Math.max(minHeight, viewportHeight),
    };
  }
  return {
    x: halfW,
    y: 0,
    width: Math.max(minWidth, viewportWidth - halfW),
    height: Math.max(minHeight, viewportHeight),
  };
}

/**
 * 창을 지정된 스냅 영역(좌/우 50% 분할 또는 상단 최대화)으로 배치합니다.
 */
export function snapWindow(
  id: string,
  zone: WindowSnapZone,
  viewport: { width: number; height: number },
  fallbackRestoreRect?: WindowRestoreRect
) {
  setState(
    produce((draft) => {
      const target = draft.windows.find((w) => w.id === id);
      if (!target) {
        draft.snapPreview = null;
        return;
      }

      target.restoreRect =
        target.restoreRect ??
        fallbackRestoreRect ?? {
          x: target.x,
          y: target.y,
          width: target.width,
          height: target.height,
        };

      if (zone === 'top') {
        target.isMaximized = true;
        target.snapZone = null;
        target.x = target.restoreRect.x;
        target.y = target.restoreRect.y;
        target.width = target.restoreRect.width;
        target.height = target.restoreRect.height;
      } else {
        const minW = target.minWidth ?? MIN_WINDOW_WIDTH;
        const minH = target.minHeight ?? MIN_WINDOW_HEIGHT;
        const rect = computeSnapRect(zone, viewport.width, viewport.height, minW, minH);
        target.isMaximized = false;
        target.snapZone = zone;
        target.x = rect.x;
        target.y = rect.y;
        target.width = rect.width;
        target.height = rect.height;
      }

      draft.snapPreview = null;
    })
  );
}

/**
 * 스냅 또는 최대화된 창을 해제하고 이전 크기 및 지정 위치로 복원합니다.
 */
export function unsnapWindow(
  id: string,
  nextPosition?: { x: number; y: number }
): WindowRestoreRect | null {
  const existing = state.windows.find((w) => w.id === id);
  if (!existing) return null;

  const restoredWidth = existing.restoreRect?.width ?? existing.width;
  const restoredHeight = existing.restoreRect?.height ?? existing.height;
  const nextX = Math.max(0, nextPosition?.x ?? existing.restoreRect?.x ?? existing.x);
  const nextY = Math.max(0, nextPosition?.y ?? existing.restoreRect?.y ?? existing.y);

  setState(
    'windows',
    (w) => w.id === id,
    produce((w) => {
      w.isMaximized = false;
      w.snapZone = null;
      w.x = nextX;
      w.y = nextY;
      w.width = restoredWidth;
      w.height = restoredHeight;
      w.restoreRect = undefined;
    })
  );

  return {
    x: nextX,
    y: nextY,
    width: restoredWidth,
    height: restoredHeight,
  };
}

/**
 * 데스크탑 뷰포트 크기 변경 시 스냅된 창들의 좌표와 크기를 동기화합니다.
 */
export function syncSnappedWindows(viewportWidth: number, viewportHeight: number) {
  if (viewportWidth <= 0 || viewportHeight <= 0) return;

  const hasSnapped = state.windows.some((w) => w.snapZone === 'left' || w.snapZone === 'right');
  if (!hasSnapped) return;

  setState(
    produce((draft) => {
      draft.windows.forEach((w) => {
        if (w.snapZone !== 'left' && w.snapZone !== 'right') return;
        const minW = w.minWidth ?? MIN_WINDOW_WIDTH;
        const minH = w.minHeight ?? MIN_WINDOW_HEIGHT;
        const rect = computeSnapRect(w.snapZone, viewportWidth, viewportHeight, minW, minH);
        w.x = rect.x;
        w.y = rect.y;
        w.width = rect.width;
        w.height = rect.height;
      });
    })
  );
}

export const windowStore = {
  state,
  openWindow,
  focusWindow,
  blurAllWindows,
  closeWindow,
  minimizeWindow,
  toggleMaximizeWindow,
  toggleTaskbarWindow,
  moveWindow,
  resizeWindow,
  setInteracting,
  setSnapPreview,
  snapWindow,
  unsnapWindow,
  syncSnappedWindows,
};
