import { createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import type {
  DesktopGridConfig,
  DesktopGridLayout,
  DesktopGridPlacement,
} from '../../types/fdCore.desktop.type';

const SHORT_SIDE_COUNT_STORAGE_KEY = 'ferdy.desktop.shortSideCount';
const PLACEMENTS_STORAGE_KEY = 'ferdy.desktop.placements';

const DEFAULT_GRID_CONFIG: DesktopGridConfig = {
  defaultShortSideCount: 6,
  minShortSideCount: 3,
  maxShortSideCount: 14,
  gap: 10,
  padding: 16,
};

function clampShortSideCount(value: number): number {
  return Math.min(
    DEFAULT_GRID_CONFIG.maxShortSideCount,
    Math.max(DEFAULT_GRID_CONFIG.minShortSideCount, Math.round(value))
  );
}

function loadInitialShortSideCount(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_GRID_CONFIG.defaultShortSideCount;
  }
  try {
    const raw = window.localStorage.getItem(SHORT_SIDE_COUNT_STORAGE_KEY);
    if (!raw) return DEFAULT_GRID_CONFIG.defaultShortSideCount;
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      return clampShortSideCount(parsed);
    }
  } catch {
    // localStorage 접근 불가 환경 무시
  }
  return DEFAULT_GRID_CONFIG.defaultShortSideCount;
}

function loadInitialPlacements(): Record<string, DesktopGridPlacement> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PLACEMENTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, DesktopGridPlacement>;
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    // localStorage 접근 불가 또는 파싱 실패 무시
  }
  return {};
}

/**
 * 데스크탑 영역의 짧은 변 셀 개수(shortSideCount)를 기준으로
 * 긴 변을 정사각형에 가장 가까운 정수로 균등 분할합니다.
 */
export function computeDesktopGridLayout(
  viewportWidth: number,
  viewportHeight: number,
  shortSideCount: number,
  gap = DEFAULT_GRID_CONFIG.gap,
  padding = DEFAULT_GRID_CONFIG.padding
): DesktopGridLayout {
  const availW = Math.max(1, viewportWidth - padding * 2);
  const availH = Math.max(1, viewportHeight - padding * 2);
  const clampedCount = clampShortSideCount(shortSideCount);

  let cols: number;
  let rows: number;
  let cellWidth: number;
  let cellHeight: number;

  if (availH <= availW) {
    rows = clampedCount;
    cellHeight = Math.max(1, (availH - gap * (rows - 1)) / rows);
    cols = Math.max(1, Math.round((availW + gap) / (cellHeight + gap)));
    cellWidth = Math.max(1, (availW - gap * (cols - 1)) / cols);
  } else {
    cols = clampedCount;
    cellWidth = Math.max(1, (availW - gap * (cols - 1)) / cols);
    rows = Math.max(1, Math.round((availH + gap) / (cellWidth + gap)));
    cellHeight = Math.max(1, (availH - gap * (rows - 1)) / rows);
  }

  return {
    cols,
    rows,
    cellWidth,
    cellHeight,
    cellSize: Math.min(cellWidth, cellHeight),
  };
}

/**
 * 저장된 좌표(placements)와 현재 그리드(cols × rows)를 바탕으로
 * 모든 아이템 ID에 대해 겹치지 않는 유효한 (col, row) 좌표를 계산합니다.
 */
export function resolveGridPlacements(
  itemIds: string[],
  savedPlacements: Record<string, DesktopGridPlacement>,
  cols: number,
  rows: number
): Record<string, DesktopGridPlacement> {
  const result: Record<string, DesktopGridPlacement> = {};
  const occupied = new Set<string>();
  const unplaced: string[] = [];

  for (const id of itemIds) {
    const saved = savedPlacements[id];
    if (
      saved &&
      saved.col >= 1 &&
      saved.col <= cols &&
      saved.row >= 1 &&
      saved.row <= rows
    ) {
      const key = `${saved.col},${saved.row}`;
      if (!occupied.has(key)) {
        occupied.add(key);
        result[id] = { col: saved.col, row: saved.row };
        continue;
      }
    }
    unplaced.push(id);
  }

  // 미배치 또는 범위 이탈 아이템은 세로(열) 우선 빈 셀에 순서대로 배치
  let cursorCol = 1;
  let cursorRow = 1;

  for (const id of unplaced) {
    while (cursorCol <= cols && occupied.has(`${cursorCol},${cursorRow}`)) {
      cursorRow += 1;
      if (cursorRow > rows) {
        cursorRow = 1;
        cursorCol += 1;
      }
    }

    const col = Math.min(cols, cursorCol);
    const row = Math.min(rows, cursorRow);
    occupied.add(`${col},${row}`);
    result[id] = { col, row };
  }

  return result;
}

interface DesktopStoreState {
  viewportWidth: number;
  viewportHeight: number;
  shortSideCount: number;
  gap: number;
  padding: number;
  isDesktopFocused: boolean;
  /** 개발/확인 중 격자 상시 표시 여부 (추후 false로 전환) */
  alwaysShowGhostGrid: boolean;
  showGhostGrid: boolean;
  placements: Record<string, DesktopGridPlacement>;
}

const [state, setState] = createStore<DesktopStoreState>({
  viewportWidth: typeof window !== 'undefined' ? Math.max(1, window.innerWidth) : 1280,
  viewportHeight: typeof window !== 'undefined' ? Math.max(1, window.innerHeight - 48) : 720,
  shortSideCount: loadInitialShortSideCount(),
  gap: DEFAULT_GRID_CONFIG.gap,
  padding: DEFAULT_GRID_CONFIG.padding,
  isDesktopFocused: true,
  alwaysShowGhostGrid: false,
  showGhostGrid: false,
  placements: loadInitialPlacements(),
});

let ghostHideTimer: ReturnType<typeof setTimeout> | undefined;

const gridLayout = createMemo(() =>
  computeDesktopGridLayout(
    state.viewportWidth,
    state.viewportHeight,
    state.shortSideCount,
    state.gap,
    state.padding
  )
);

function persistShortSideCount(count: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SHORT_SIDE_COUNT_STORAGE_KEY, String(count));
  } catch {
    // localStorage 접근 불가 환경 무시
  }
}

function persistPlacements(placements: Record<string, DesktopGridPlacement>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PLACEMENTS_STORAGE_KEY, JSON.stringify(placements));
  } catch {
    // localStorage 접근 불가 환경 무시
  }
}

function flashGhostGrid(durationMs = 950): void {
  if (ghostHideTimer !== undefined) {
    clearTimeout(ghostHideTimer);
  }
  setState('showGhostGrid', true);
  if (state.alwaysShowGhostGrid) return;
  ghostHideTimer = setTimeout(() => {
    setState('showGhostGrid', false);
    ghostHideTimer = undefined;
  }, durationMs);
}

export const desktopStore = {
  state,
  gridLayout,
  config: DEFAULT_GRID_CONFIG,

  getViewportSize(): { width: number; height: number } {
    return {
      width:
        state.viewportWidth ||
        (typeof window !== 'undefined' ? window.innerWidth : 1280),
      height:
        state.viewportHeight ||
        (typeof window !== 'undefined' ? window.innerHeight - 48 : 720),
    };
  },

  setViewportSize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    setState({
      viewportWidth: width,
      viewportHeight: height,
    });
  },

  setDesktopFocused(focused: boolean): void {
    setState('isDesktopFocused', focused);
  },

  setGhostVisible(visible: boolean): void {
    if (ghostHideTimer !== undefined) {
      clearTimeout(ghostHideTimer);
      ghostHideTimer = undefined;
    }
    setState('showGhostGrid', visible || state.alwaysShowGhostGrid);
  },

  /**
   * Ctrl+Wheel 등으로 짧은 변의 셀 개수를 1개씩 증감합니다.
   */
  zoomByStep(direction: 1 | -1, itemCount = 0): void {
    const deltaCount = direction > 0 ? -1 : 1;
    const nextCount = clampShortSideCount(state.shortSideCount + deltaCount);

    if (nextCount !== state.shortSideCount) {
      if (direction > 0 && itemCount > 0) {
        const nextLayout = computeDesktopGridLayout(
          state.viewportWidth,
          state.viewportHeight,
          nextCount,
          state.gap,
          state.padding
        );
        if (nextLayout.cols * nextLayout.rows < itemCount) {
          flashGhostGrid();
          return;
        }
      }

      setState('shortSideCount', nextCount);
      persistShortSideCount(nextCount);
    }

    flashGhostGrid();
  },

  /**
   * 드래그 앤 드롭으로 아이템을 목표 셀 (targetCol, targetRow)로 이동합니다.
   * 목표 셀에 다른 아이템이 있으면 두 아이템의 위치를 서로 교환(swap)합니다.
   */
  moveItem(
    itemId: string,
    targetCol: number,
    targetRow: number,
    allItemIds: string[]
  ): void {
    const { cols, rows } = gridLayout();
    const col = Math.min(cols, Math.max(1, targetCol));
    const row = Math.min(rows, Math.max(1, targetRow));

    const resolved = resolveGridPlacements(allItemIds, state.placements, cols, rows);
    const currentPos = resolved[itemId];
    if (!currentPos) return;
    if (currentPos.col === col && currentPos.row === row) return;

    const occupantId = Object.keys(resolved).find(
      (id) => id !== itemId && resolved[id].col === col && resolved[id].row === row
    );

    const nextPlacements: Record<string, DesktopGridPlacement> = {
      ...resolved,
      [itemId]: { col, row },
    };

    if (occupantId) {
      nextPlacements[occupantId] = { col: currentPos.col, row: currentPos.row };
    }

    setState('placements', nextPlacements);
    persistPlacements(nextPlacements);
  },
};
