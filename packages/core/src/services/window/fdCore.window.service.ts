import type {
  InitialWindowSession,
  WindowInstance,
  WindowRestoreRect,
  WindowViewportSize,
} from '../../types/fdCore.window.type';

export const BASE_Z_INDEX = 100;
export const WINDOW_SESSION_STORAGE_KEY = 'ferdy.window.session';
export const WINDOW_TITLEBAR_HEIGHT = 38;
export const WINDOW_FRAME_BORDER = 2;
export const MIN_WINDOW_WIDTH = 320;
export const MIN_WINDOW_HEIGHT = 220;

const CASCADE_START_X = 40;
const CASCADE_START_Y = 32;
const CASCADE_STEP_PX = 32;
const CASCADE_MAX_STEPS = 8;

/**
 * 창 인스턴스 또는 생성 페이로드의 유효 최소 크기를 반환합니다.
 */
export function getWindowMinSize(win: {
  minWidth?: number;
  minHeight?: number;
}): { minW: number; minH: number } {
  return {
    minW: win.minWidth ?? MIN_WINDOW_WIDTH,
    minH: win.minHeight ?? MIN_WINDOW_HEIGHT,
  };
}

/**
 * 창의 현재 좌표 및 크기를 복원용 사각형으로 캡처합니다.
 */
export function captureRestoreRect(
  win: Pick<WindowInstance, 'x' | 'y' | 'width' | 'height'>
): WindowRestoreRect {
  return {
    x: win.x,
    y: win.y,
    width: win.width,
    height: win.height,
  };
}

/**
 * 저장된 복원 사각형(restoreRect) 데이터의 유효성을 검증하고 최소 크기를 보정합니다.
 */
export function sanitizeRestoreRect(
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

/**
 * localStorage에서 이전 창 세션 상태를 불러와 검증 및 Z-Index/포커스 정합성을 정규화합니다.
 */
export function loadInitialWindowSession(): InitialWindowSession {
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
      const { minW, minH } = getWindowMinSize({ minWidth, minHeight });

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

/**
 * 현재 창 목록을 localStorage 세션에 직렬화하여 저장합니다.
 */
export function saveWindowSession(windows: WindowInstance[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      WINDOW_SESSION_STORAGE_KEY,
      JSON.stringify(windows)
    );
  } catch {
    // localStorage 접근 불가 또는 저장 한도 초과 무시
  }
}

/**
 * 좌/우 스냅 영역에 맞는 창 좌표와 크기를 계산합니다.
 */
export function computeSnapRect(
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
 * 격자(Tile) 정렬 시 특정 인덱스 창의 좌표와 크기를 계산합니다.
 */
export function computeTileRect(
  index: number,
  totalCount: number,
  viewport: WindowViewportSize,
  minWidth: number,
  minHeight: number
): WindowRestoreRect {
  const cols = Math.ceil(Math.sqrt(totalCount));
  const rows = Math.ceil(totalCount / cols);
  const cellH = Math.floor(viewport.height / rows);
  const row = Math.floor(index / cols);
  const colInRow = index % cols;
  const isLastRow = row === rows - 1;
  const colsInThisRow = isLastRow ? totalCount - row * cols : cols;
  const cellW = Math.floor(viewport.width / colsInThisRow);
  const x = colInRow * cellW;
  const y = row * cellH;
  const width = colInRow === colsInThisRow - 1 ? viewport.width - x : cellW;
  const height = row === rows - 1 ? viewport.height - y : cellH;

  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.max(minWidth, width),
    height: Math.max(minHeight, height),
  };
}

/**
 * 계단식(Cascade) 정렬 시 특정 인덱스 창의 좌표와 크기를 계산합니다.
 */
export function computeCascadeRect(
  index: number,
  win: Pick<WindowInstance, 'width' | 'height' | 'minWidth' | 'minHeight' | 'restoreRect'>,
  viewport: WindowViewportSize
): WindowRestoreRect {
  const offsetIdx = index % CASCADE_MAX_STEPS;
  const { minW, minH } = getWindowMinSize(win);
  const baseW =
    win.restoreRect?.width ??
    Math.min(win.width, Math.round(viewport.width * 0.65));
  const baseH =
    win.restoreRect?.height ??
    Math.min(win.height, Math.round(viewport.height * 0.68));
  const width = Math.max(
    minW,
    Math.min(baseW, Math.max(minW, viewport.width - CASCADE_START_X - 40))
  );
  const height = Math.max(
    minH,
    Math.min(baseH, Math.max(minH, viewport.height - CASCADE_START_Y - 40))
  );
  const maxX = Math.max(0, viewport.width - width);
  const maxY = Math.max(0, viewport.height - height);

  return {
    x: Math.min(CASCADE_START_X + offsetIdx * CASCADE_STEP_PX, maxX),
    y: Math.min(CASCADE_START_Y + offsetIdx * CASCADE_STEP_PX, maxY),
    width,
    height,
  };
}
