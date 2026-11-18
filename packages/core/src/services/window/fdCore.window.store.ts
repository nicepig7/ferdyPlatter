import { createStore, produce, unwrap } from 'solid-js/store';
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
const WINDOW_SESSION_STORAGE_KEY = 'ferdy.window.session';
export const WINDOW_TITLEBAR_HEIGHT = 38;
export const WINDOW_FRAME_BORDER = 2;
export const MIN_WINDOW_WIDTH = 320;
export const MIN_WINDOW_HEIGHT = 220;

let stashedMinimizeIds: string[] = [];
let stashedActiveWindowId: string | null = null;

function clearStashedMinimize(): void {
  stashedMinimizeIds = [];
  stashedActiveWindowId = null;
}

function sanitizeRestoreRect(
  raw: unknown,
  minWidth: number,
  minHeight: number
): WindowRestoreRect | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const candidate = raw as Record<string, unknown>;
  if (
    typeof candidate.x !== 'number' ||
    !Number.isFinite(candidate.x) ||
    typeof candidate.y !== 'number' ||
    !Number.isFinite(candidate.y) ||
    typeof candidate.width !== 'number' ||
    !Number.isFinite(candidate.width) ||
    typeof candidate.height !== 'number' ||
    !Number.isFinite(candidate.height)
  ) {
    return undefined;
  }

  return {
    x: Math.max(0, candidate.x),
    y: Math.max(0, candidate.y),
    width: Math.max(minWidth, candidate.width),
    height: Math.max(minHeight, candidate.height),
  };
}

interface InitialWindowSession {
  windows: WindowInstance[];
  activeWindowId: string | null;
  topZIndex: number;
}

/**
 * localStorage에서 이전 창 세션 상태를 불러와 검증 및 Z-Index/포커스 정합성을 정규화합니다.
 */
function loadInitialWindowSession(): InitialWindowSession {
  const emptySession: InitialWindowSession = {
    windows: [],
    activeWindowId: null,
    topZIndex: BASE_Z_INDEX,
  };

  if (typeof window === 'undefined') return emptySession;

  try {
    const raw = window.localStorage.getItem(WINDOW_SESSION_STORAGE_KEY);
    if (!raw) return emptySession;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return emptySession;

    const seenIds = new Set<string>();
    const sanitized: WindowInstance[] = [];

    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const candidate = item as Record<string, unknown>;
      if (
        typeof candidate.id !== 'string' ||
        !candidate.id ||
        seenIds.has(candidate.id) ||
        typeof candidate.title !== 'string' ||
        typeof candidate.appUrl !== 'string'
      ) {
        continue;
      }

      seenIds.add(candidate.id);

      const minWidth =
        typeof candidate.minWidth === 'number' &&
        Number.isFinite(candidate.minWidth) &&
        candidate.minWidth > 0
          ? candidate.minWidth
          : undefined;
      const minHeight =
        typeof candidate.minHeight === 'number' &&
        Number.isFinite(candidate.minHeight) &&
        candidate.minHeight > 0
          ? candidate.minHeight
          : undefined;
      const minW = minWidth ?? MIN_WINDOW_WIDTH;
      const minH = minHeight ?? MIN_WINDOW_HEIGHT;

      const x =
        typeof candidate.x === 'number' && Number.isFinite(candidate.x)
          ? Math.max(0, candidate.x)
          : 100;
      const y =
        typeof candidate.y === 'number' && Number.isFinite(candidate.y)
          ? Math.max(0, candidate.y)
          : 70;
      const width =
        typeof candidate.width === 'number' && Number.isFinite(candidate.width)
          ? Math.max(minW, candidate.width)
          : Math.max(minW, 640);
      const height =
        typeof candidate.height === 'number' && Number.isFinite(candidate.height)
          ? Math.max(minH, candidate.height)
          : Math.max(minH, 440);
      const zIndex =
        typeof candidate.zIndex === 'number' && Number.isFinite(candidate.zIndex)
          ? candidate.zIndex
          : BASE_Z_INDEX + sanitized.length + 1;

      const snapZone =
        candidate.snapZone === 'left' || candidate.snapZone === 'right'
          ? candidate.snapZone
          : null;

      sanitized.push({
        id: candidate.id,
        appId: typeof candidate.appId === 'string' ? candidate.appId : undefined,
        title: candidate.title,
        appUrl: candidate.appUrl,
        icon: typeof candidate.icon === 'string' ? candidate.icon : undefined,
        x,
        y,
        width,
        height,
        minWidth,
        minHeight,
        zIndex,
        isFocused: Boolean(candidate.isFocused),
        isMinimized: Boolean(candidate.isMinimized),
        isMaximized: Boolean(candidate.isMaximized),
        snapZone,
        restoreRect: sanitizeRestoreRect(candidate.restoreRect, minW, minH),
      });
    }

    if (sanitized.length === 0) return emptySession;

    // 기존 쌓임 순서를 유지하면서 zIndex를 BASE_Z_INDEX + 1부터 정규화 (태스크바 순서 유지)
    const sortedByZ = sanitized
      .map((win, idx) => ({ idx, zIndex: win.zIndex }))
      .sort((a, b) => a.zIndex - b.zIndex);
    sortedByZ.forEach((entry, rank) => {
      sanitized[entry.idx].zIndex = BASE_Z_INDEX + 1 + rank;
    });

    const visibleWindows = sanitized.filter((w) => !w.isMinimized);
    let activeWindowId: string | null = null;
    if (visibleWindows.length > 0) {
      const focusedWin =
        visibleWindows.find((w) => w.isFocused) ??
        visibleWindows.reduce((prev, curr) =>
          curr.zIndex > prev.zIndex ? curr : prev
        );
      activeWindowId = focusedWin.id;
      sanitized.forEach((w) => {
        w.isFocused = w.id === activeWindowId;
      });
    } else {
      sanitized.forEach((w) => {
        w.isFocused = false;
      });
    }

    return {
      windows: sanitized,
      activeWindowId,
      topZIndex: BASE_Z_INDEX + sanitized.length,
    };
  } catch {
    return emptySession;
  }
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
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      WINDOW_SESSION_STORAGE_KEY,
      JSON.stringify(unwrap(state.windows))
    );
  } catch {
    // localStorage 접근 불가 또는 저장 한도 초과 무시
  }
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

  clearStashedMinimize();

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

  persistWindowSession();
}

/**
 * 특정 창을 클릭하거나 활성화할 때 최상단(Z-index 갱신)으로 올리고 포커스 상태를 부여합니다.
 */
export function focusWindow(id: string) {
  if (!state.windows.some((w) => w.id === id)) return;

  clearStashedMinimize();

  setState(
    produce((draft) => {
      focusWindowInDraft(draft, id);
    })
  );

  persistWindowSession();
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

  persistWindowSession();
}

/**
 * 창 닫기
 */
export function closeWindow(id: string) {
  if (!state.windows.some((w) => w.id === id)) return;

  clearStashedMinimize();

  setState(
    produce((draft) => {
      draft.windows = draft.windows.filter((w) => w.id !== id);

      if (draft.activeWindowId === id) {
        focusNextTopWindowInDraft(draft);
      }
    })
  );

  persistWindowSession();
}

/**
 * 창 최소화 (태스크바로 내리기)
 */
export function minimizeWindow(id: string) {
  if (!state.windows.some((w) => w.id === id)) return;

  clearStashedMinimize();

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

  persistWindowSession();
}

/**
 * 창 최대화 / 이전 크기 복원 토글
 */
export function toggleMaximizeWindow(id: string) {
  if (!state.windows.some((w) => w.id === id)) return;

  clearStashedMinimize();

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

  persistWindowSession();
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
 * 인터랙션 종료 시점에 현재 창 세션을 localStorage에 저장합니다.
 */
export function setInteracting(interacting: boolean) {
  const wasInteracting = state.isInteracting;

  setState(
    produce((draft) => {
      draft.isInteracting = interacting;
      if (!interacting) {
        draft.snapPreview = null;
      }
    })
  );

  if (wasInteracting && !interacting) {
    persistWindowSession();
  }
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
  clearStashedMinimize();

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

  persistWindowSession();
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

  persistWindowSession();

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

  persistWindowSession();
}

/**
 * 현재 화면에 보이는(최소화되지 않은) 창들을 격자(Tile) 형태로 균등 분할 배치합니다.
 */
export function tileWindows(viewport: { width: number; height: number }) {
  const visible = state.windows.filter((w) => !w.isMinimized);
  if (visible.length === 0 || viewport.width <= 0 || viewport.height <= 0) {
    return;
  }

  clearStashedMinimize();

  const count = visible.length;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cellH = Math.floor(viewport.height / rows);

  setState(
    produce((draft) => {
      const draftVisible = draft.windows.filter((w) => !w.isMinimized);
      draftVisible.forEach((win, idx) => {
        const row = Math.floor(idx / cols);
        const colInRow = idx % cols;
        const isLastRow = row === rows - 1;
        const colsInThisRow = isLastRow ? draftVisible.length - row * cols : cols;
        const cellW = Math.floor(viewport.width / colsInThisRow);
        const x = colInRow * cellW;
        const y = row * cellH;
        const width = colInRow === colsInThisRow - 1 ? viewport.width - x : cellW;
        const height = row === rows - 1 ? viewport.height - y : cellH;

        if (!win.restoreRect && !win.isMaximized && !win.snapZone) {
          win.restoreRect = {
            x: win.x,
            y: win.y,
            width: win.width,
            height: win.height,
          };
        }

        win.isMaximized = false;
        win.snapZone = null;
        win.x = Math.max(0, x);
        win.y = Math.max(0, y);
        win.width = Math.max(win.minWidth ?? MIN_WINDOW_WIDTH, width);
        win.height = Math.max(win.minHeight ?? MIN_WINDOW_HEIGHT, height);
      });

      if (!draft.activeWindowId) {
        focusNextTopWindowInDraft(draft);
      }
    })
  );

  persistWindowSession();
}

/**
 * 현재 화면에 보이는(최소화되지 않은) 창들을 좌상단부터 계단식(Cascade)으로 정렬합니다.
 */
export function cascadeWindows(viewport: { width: number; height: number }) {
  const visible = state.windows.filter((w) => !w.isMinimized);
  if (visible.length === 0 || viewport.width <= 0 || viewport.height <= 0) {
    return;
  }

  clearStashedMinimize();

  const startX = 40;
  const startY = 32;
  const step = 32;
  const maxCascadeSteps = 8;

  setState(
    produce((draft) => {
      const draftVisible = draft.windows.filter((w) => !w.isMinimized);
      draftVisible.forEach((win, idx) => {
        const offsetIdx = idx % maxCascadeSteps;
        const minW = win.minWidth ?? MIN_WINDOW_WIDTH;
        const minH = win.minHeight ?? MIN_WINDOW_HEIGHT;
        const baseW =
          win.restoreRect?.width ??
          Math.min(win.width, Math.round(viewport.width * 0.65));
        const baseH =
          win.restoreRect?.height ??
          Math.min(win.height, Math.round(viewport.height * 0.68));
        const width = Math.max(
          minW,
          Math.min(baseW, Math.max(minW, viewport.width - startX - 40))
        );
        const height = Math.max(
          minH,
          Math.min(baseH, Math.max(minH, viewport.height - startY - 40))
        );
        const maxX = Math.max(0, viewport.width - width);
        const maxY = Math.max(0, viewport.height - height);

        win.x = Math.min(startX + offsetIdx * step, maxX);
        win.y = Math.min(startY + offsetIdx * step, maxY);
        win.width = width;
        win.height = height;
        win.isMaximized = false;
        win.snapZone = null;
        win.restoreRect = undefined;

        draft.topZIndex += 1;
        win.zIndex = draft.topZIndex;
        win.isFocused = idx === draftVisible.length - 1;
      });

      const lastWin = draftVisible[draftVisible.length - 1];
      draft.activeWindowId = lastWin ? lastWin.id : null;
    })
  );

  persistWindowSession();
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

    setState(
      produce((draft) => {
        draft.windows.forEach((w) => {
          w.isMinimized = true;
          w.isFocused = false;
        });
        draft.activeWindowId = null;
      })
    );
  } else {
    const targetIds =
      stashedMinimizeIds.length > 0
        ? new Set(stashedMinimizeIds)
        : new Set(state.windows.map((w) => w.id));
    const preferredActiveId = stashedActiveWindowId;
    clearStashedMinimize();

    setState(
      produce((draft) => {
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
          draft.windows.some(
            (w) => w.id === preferredActiveId && !w.isMinimized
          )
        ) {
          focusWindowInDraft(draft, preferredActiveId);
        } else {
          focusNextTopWindowInDraft(draft);
        }
      })
    );
  }

  persistWindowSession();
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
  tileWindows,
  cascadeWindows,
  toggleMinimizeAllWindows,
};
