import { createStore, produce } from 'solid-js/store';
import type { CreateWindowPayload, WindowInstance } from '../../types/fdType.window';

interface WindowStoreState {
  windows: WindowInstance[];
  activeWindowId: string | null;
  topZIndex: number;
}

const BASE_Z_INDEX = 100;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 220;

const [state, setState] = createStore<WindowStoreState>({
  windows: [],
  activeWindowId: null,
  topZIndex: BASE_Z_INDEX,
});

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
        width: payload.width ?? 640,
        height: payload.height ?? 440,
        zIndex: nextZ,
        isFocused: true,
        isMinimized: false,
        isMaximized: false,
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
  const target = state.windows.find((w) => w.id === id);
  if (!target) return;

  const nextZ = state.topZIndex + 1;

  setState(
    produce((draft) => {
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
        const remaining = draft.windows.filter((w) => !w.isMinimized);
        if (remaining.length > 0) {
          const nextTop = remaining.reduce((prev, curr) =>
            curr.zIndex > prev.zIndex ? curr : prev
          );
          nextTop.isFocused = true;
          draft.activeWindowId = nextTop.id;
        } else {
          draft.activeWindowId = null;
        }
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
      target.isMaximized = !target.isMaximized;
    })
  );
  focusWindow(id);
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
      w.width = Math.max(MIN_WIDTH, rect.width);
      w.height = Math.max(MIN_HEIGHT, rect.height);
      if (rect.x !== undefined) w.x = rect.x;
      if (rect.y !== undefined) w.y = rect.y;
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
};
