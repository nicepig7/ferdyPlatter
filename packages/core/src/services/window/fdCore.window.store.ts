import { createStore, produce, unwrap } from 'solid-js/store';
import type {
  CreateWindowPayload,
  ReplaceWindowPayload,
  WindowInstance,
  WindowRestoreRect,
  WindowSnapZone,
  WindowStoreState,
  WindowViewportSize,
} from '../../types/fdCore.window.type';
import {
  BASE_Z_INDEX,
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  WINDOW_FRAME_BORDER,
  WINDOW_TITLEBAR_HEIGHT,
  captureRestoreRect,
  computeCascadeRect,
  computeSnapRect,
  computeTileRect,
  getWindowMinSize,
  loadInitialWindowSession,
  saveWindowSession,
} from './fdCore.window.service';

export {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  WINDOW_FRAME_BORDER,
  WINDOW_TITLEBAR_HEIGHT,
};

let stashedMinimizeIds: string[] = [];
let stashedActiveWindowId: string | null = null;

function clearStashedMinimize(): void {
  stashedMinimizeIds = [];
  stashedActiveWindowId = null;
}

const initialSession = loadInitialWindowSession();

const [state, setState] = createStore<WindowStoreState>({
  windows: initialSession.windows,
  activeWindowId: initialSession.activeWindowId,
  topZIndex: initialSession.topZIndex,
  isInteracting: false,
  snapPreview: null,
});

function persistWindowSession(): void {
  saveWindowSession(unwrap(state.windows));
}

function commitWindowMutation(
  recipe: (draft: WindowStoreState) => void,
  options?: { clearStash?: boolean; persist?: boolean }
): void {
  if (options?.clearStash ?? true) {
    clearStashedMinimize();
  }
  setState(produce(recipe));
  if (options?.persist ?? true) {
    persistWindowSession();
  }
}

function applyWindowRect(win: WindowInstance, rect: WindowRestoreRect): void {
  win.x = rect.x;
  win.y = rect.y;
  win.width = rect.width;
  win.height = rect.height;
}

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

  const offset = (state.windows.length % 6) * 32;
  const id = payload.id ?? `win-${Date.now()}`;
  const { minW, minH } = getWindowMinSize(payload);

  commitWindowMutation((draft) => {
    const nextZ = draft.topZIndex + 1;

    draft.windows.forEach((w) => {
      w.isFocused = false;
    });

    draft.windows.push({
      id,
      appId: payload.appId,
      title: payload.title,
      appUrl: payload.appUrl ?? '',
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
  });
}

/**
 * 특정 창을 클릭하거나 활성화할 때 최상단(Z-index 갱신)으로 올리고 포커스 상태를 부여합니다.
 */
export function focusWindow(id: string) {
  if (!state.windows.some((w) => w.id === id)) return;

  commitWindowMutation((draft) => {
    focusWindowInDraft(draft, id);
  });
}

/**
 * 바탕화면/태스크바 등 창 외부 영역 클릭 시 모든 창의 포커스를 해제합니다.
 */
export function blurAllWindows() {
  if (!state.activeWindowId) return;

  commitWindowMutation(
    (draft) => {
      draft.windows.forEach((w) => {
        w.isFocused = false;
      });
      draft.activeWindowId = null;
    },
    { clearStash: false }
  );
}

/**
 * 창 닫기
 */
export function closeWindow(id: string) {
  if (!state.windows.some((w) => w.id === id)) return;

  commitWindowMutation((draft) => {
    draft.windows = draft.windows.filter((w) => w.id !== id);

    if (draft.activeWindowId === id) {
      focusNextTopWindowInDraft(draft);
    }
  });
}

/**
 * 창 최소화 (태스크바로 내리기)
 */
export function minimizeWindow(id: string) {
  if (!state.windows.some((w) => w.id === id)) return;

  commitWindowMutation((draft) => {
    const target = draft.windows.find((w) => w.id === id);
    if (!target) return;

    target.isMinimized = true;
    target.isFocused = false;

    if (draft.activeWindowId === id) {
      focusNextTopWindowInDraft(draft);
    }
  });
}

/**
 * 창 최대화 / 이전 크기 복원 토글
 */
export function toggleMaximizeWindow(id: string) {
  if (!state.windows.some((w) => w.id === id)) return;

  commitWindowMutation((draft) => {
    const target = draft.windows.find((w) => w.id === id);
    if (!target) return;

    if (!target.isMaximized) {
      if (!target.restoreRect) {
        target.restoreRect = captureRestoreRect(target);
      }
      target.isMaximized = true;
      target.snapZone = null;
    } else {
      target.isMaximized = false;
      target.snapZone = null;
      if (target.restoreRect) {
        applyWindowRect(target, target.restoreRect);
        target.restoreRect = undefined;
      }
    }

    focusWindowInDraft(draft, id);
  });
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
      const { minW, minH } = getWindowMinSize(w);
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
 * 인터랙션 종료 시점에 현재 창 세션을 localStorage에 저장합니다.
 */
export function setInteracting(interacting: boolean) {
  const wasInteracting = state.isInteracting;

  commitWindowMutation(
    (draft) => {
      draft.isInteracting = interacting;
      if (!interacting) {
        draft.snapPreview = null;
      }
    },
    {
      clearStash: false,
      persist: wasInteracting && !interacting,
    }
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
 * 창을 지정된 스냅 영역(좌/우 50% 분할 또는 상단 최대화)으로 배치합니다.
 */
export function snapWindow(
  id: string,
  zone: WindowSnapZone,
  viewport: WindowViewportSize,
  fallbackRestoreRect?: WindowRestoreRect
) {
  commitWindowMutation((draft) => {
    const target = draft.windows.find((w) => w.id === id);
    if (!target) {
      draft.snapPreview = null;
      return;
    }

    target.restoreRect =
      target.restoreRect ?? fallbackRestoreRect ?? captureRestoreRect(target);

    if (zone === 'top') {
      target.isMaximized = true;
      target.snapZone = null;
      applyWindowRect(target, target.restoreRect);
    } else {
      const { minW, minH } = getWindowMinSize(target);
      const rect = computeSnapRect(
        zone,
        viewport.width,
        viewport.height,
        minW,
        minH
      );
      target.isMaximized = false;
      target.snapZone = zone;
      applyWindowRect(target, rect);
    }

    draft.snapPreview = null;
  });
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

  clearStashedMinimize();

  const restoredRect: WindowRestoreRect = {
    x: Math.max(0, nextPosition?.x ?? existing.restoreRect?.x ?? existing.x),
    y: Math.max(0, nextPosition?.y ?? existing.restoreRect?.y ?? existing.y),
    width: existing.restoreRect?.width ?? existing.width,
    height: existing.restoreRect?.height ?? existing.height,
  };

  setState(
    'windows',
    (w) => w.id === id,
    produce((w) => {
      w.isMaximized = false;
      w.snapZone = null;
      applyWindowRect(w, restoredRect);
      w.restoreRect = undefined;
    })
  );

  persistWindowSession();

  return restoredRect;
}

/**
 * 데스크탑 뷰포트 크기 변경 시 스냅된 창들의 좌표와 크기를 동기화합니다.
 */
export function syncSnappedWindows(viewportWidth: number, viewportHeight: number) {
  if (viewportWidth <= 0 || viewportHeight <= 0) return;

  const hasSnapped = state.windows.some(
    (w) => w.snapZone === 'left' || w.snapZone === 'right'
  );
  if (!hasSnapped) return;

  commitWindowMutation(
    (draft) => {
      draft.windows.forEach((w) => {
        if (w.snapZone !== 'left' && w.snapZone !== 'right') return;
        const { minW, minH } = getWindowMinSize(w);
        const rect = computeSnapRect(
          w.snapZone,
          viewportWidth,
          viewportHeight,
          minW,
          minH
        );
        applyWindowRect(w, rect);
      });
    },
    { clearStash: false }
  );
}

/**
 * 현재 화면에 보이는(최소화되지 않은) 창들을 격자(Tile) 형태로 균등 분할 배치합니다.
 */
export function tileWindows(viewport: WindowViewportSize) {
  const visible = state.windows.filter((w) => !w.isMinimized);
  if (visible.length === 0 || viewport.width <= 0 || viewport.height <= 0) {
    return;
  }

  commitWindowMutation((draft) => {
    const draftVisible = draft.windows.filter((w) => !w.isMinimized);
    const totalCount = draftVisible.length;

    draftVisible.forEach((win, idx) => {
      const { minW, minH } = getWindowMinSize(win);
      const rect = computeTileRect(idx, totalCount, viewport, minW, minH);

      if (!win.restoreRect && !win.isMaximized && !win.snapZone) {
        win.restoreRect = captureRestoreRect(win);
      }

      win.isMaximized = false;
      win.snapZone = null;
      applyWindowRect(win, rect);
    });

    if (!draft.activeWindowId) {
      focusNextTopWindowInDraft(draft);
    }
  });
}

/**
 * 현재 화면에 보이는(최소화되지 않은) 창들을 좌상단부터 계단식(Cascade)으로 정렬합니다.
 */
export function cascadeWindows(viewport: WindowViewportSize) {
  const visible = state.windows.filter((w) => !w.isMinimized);
  if (visible.length === 0 || viewport.width <= 0 || viewport.height <= 0) {
    return;
  }

  commitWindowMutation((draft) => {
    const draftVisible = draft.windows.filter((w) => !w.isMinimized);
    draftVisible.forEach((win, idx) => {
      const rect = computeCascadeRect(idx, win, viewport);
      applyWindowRect(win, rect);
      win.isMaximized = false;
      win.snapZone = null;
      win.restoreRect = undefined;

      draft.topZIndex += 1;
      win.zIndex = draft.topZIndex;
      win.isFocused = idx === draftVisible.length - 1;
    });

    const lastWin = draftVisible[draftVisible.length - 1];
    draft.activeWindowId = lastWin ? lastWin.id : null;
  });
}

/**
 * 화면에 보이는 창을 모두 최소화하거나, 모두 최소화된 상태에서 이전 창들을 복원합니다(바탕화면 보기 토글).
 */
export function toggleMinimizeAllWindows() {
  if (state.windows.length === 0) return;

  const visibleWindows = state.windows.filter((w) => !w.isMinimized);
  if (visibleWindows.length > 0) {
    stashedMinimizeIds = visibleWindows.map((w) => w.id);
    stashedActiveWindowId = state.activeWindowId;

    commitWindowMutation(
      (draft) => {
        draft.windows.forEach((w) => {
          w.isMinimized = true;
          w.isFocused = false;
        });
        draft.activeWindowId = null;
      },
      { clearStash: false }
    );
    return;
  }

  const targetIds =
    stashedMinimizeIds.length > 0
      ? new Set(stashedMinimizeIds)
      : new Set(state.windows.map((w) => w.id));
  const preferredActiveId = stashedActiveWindowId;
  clearStashedMinimize();

  commitWindowMutation(
    (draft) => {
      let restoredCount = 0;
      draft.windows.forEach((w) => {
        if (targetIds.has(w.id)) {
          w.isMinimized = false;
          restoredCount += 1;
        }
      });

      if (restoredCount === 0) {
        draft.windows.forEach((w) => {
          w.isMinimized = false;
        });
      }

      if (
        preferredActiveId &&
        draft.windows.some((w) => w.id === preferredActiveId && !w.isMinimized)
      ) {
        focusWindowInDraft(draft, preferredActiveId);
      } else {
        focusNextTopWindowInDraft(draft);
      }
    },
    { clearStash: false }
  );
}

let emptyWindowSeq = 1;

/**
 * 앱이 아직 지정되지 않은 빈 창(Empty Window / 새 창 런처)을 생성합니다.
 */
export function openEmptyWindow() {
  while (state.windows.some((w) => w.id === `empty-win-${emptyWindowSeq}`)) {
    emptyWindowSeq += 1;
  }
  const seq = emptyWindowSeq++;
  openWindow({
    id: `empty-win-${seq}`,
    title: seq === 1 ? 'Empty' : `Empty (${seq})`,
    appUrl: '',
    width: 580,
    height: 430,
  });
}

/**
 * 기존 창 인스턴스의 ID, Z-Index, 스냅/최대화 상태를 유지한 채 실행 중인 앱만 교체합니다.
 */
export function replaceWindow(id: string, payload: ReplaceWindowPayload) {
  if (!state.windows.some((w) => w.id === id)) return;

  commitWindowMutation((draft) => {
    const target = draft.windows.find((w) => w.id === id);
    if (!target) return;

    const { minW, minH } = getWindowMinSize(payload);
    const nextWidth = Math.max(minW, payload.width ?? target.width);
    const nextHeight = Math.max(minH, payload.height ?? target.height);

    target.appId = payload.appId;
    target.title = payload.title;
    target.appUrl = payload.appUrl;
    target.icon = payload.icon;
    target.minWidth = payload.minWidth;
    target.minHeight = payload.minHeight;

    if (target.isMaximized || target.snapZone) {
      if (target.snapZone) {
        target.width = Math.max(minW, target.width);
        target.height = Math.max(minH, target.height);
      }
      target.restoreRect = {
        x: target.restoreRect?.x ?? target.x,
        y: target.restoreRect?.y ?? target.y,
        width: nextWidth,
        height: nextHeight,
      };
    } else {
      target.width = nextWidth;
      target.height = nextHeight;
      target.restoreRect = undefined;
    }

    focusWindowInDraft(draft, id);
  });
}

/**
 * 열려 있는 모든 창을 닫고 세션을 초기화합니다.
 */
export function closeAllWindows() {
  if (state.windows.length === 0) return;

  commitWindowMutation((draft) => {
    draft.windows = [];
    draft.activeWindowId = null;
    draft.topZIndex = BASE_Z_INDEX;
  });
}

export const windowStore = {
  state,
  openWindow,
  openEmptyWindow,
  replaceWindow,
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
  tileWindows,
  cascadeWindows,
  toggleMinimizeAllWindows,
  closeAllWindows,
};
