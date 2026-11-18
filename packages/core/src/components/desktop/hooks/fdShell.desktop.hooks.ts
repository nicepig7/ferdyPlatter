import { createSignal, onCleanup, onMount } from 'solid-js';
import { desktopStore } from '../../../services/desktop/fdCore.desktop.store';

const DRAG_THRESHOLD_PX = 6;

export interface DragState {
  itemId: string;
  dx: number;
  dy: number;
  targetCol: number;
  targetRow: number;
}

/**
 * 바탕화면 아이콘 드래그 앤 드롭 포인터 추적 및 클릭 억제 상태를 관리합니다.
 */
export function useDesktopIconDrag(
  getDesktopEl: () => HTMLElement | undefined,
  getAllItemIds: () => string[]
) {
  let suppressNextClick = false;
  let cleanupActiveDrag: (() => void) | null = null;
  const [dragState, setDragState] = createSignal<DragState | null>(null);

  const shouldSuppressClick = () => suppressNextClick;

  const computeCellFromPointer = (clientX: number, clientY: number) => {
    const desktopEl = getDesktopEl();
    if (!desktopEl) return { col: 1, row: 1 };
    const rect = desktopEl.getBoundingClientRect();
    const { cols, rows, cellWidth, cellHeight } = desktopStore.gridLayout();
    const { padding, gap } = desktopStore.state;

    const relX = clientX - rect.left - padding;
    const relY = clientY - rect.top - padding;

    const col = Math.min(
      cols,
      Math.max(1, Math.floor(relX / (cellWidth + gap)) + 1)
    );
    const row = Math.min(
      rows,
      Math.max(1, Math.floor(relY / (cellHeight + gap)) + 1)
    );
    return { col, row };
  };

  const startIconDrag = (itemId: string, e: PointerEvent) => {
    if (e.button !== 0) return;
    cleanupActiveDrag?.();

    const startX = e.clientX;
    const startY = e.clientY;
    let isDragging = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (!isDragging && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
        return;
      }

      if (!isDragging) {
        isDragging = true;
        desktopStore.setGhostVisible(true);
      }

      const { col, row } = computeCellFromPointer(
        moveEvent.clientX,
        moveEvent.clientY
      );
      setDragState({
        itemId,
        dx,
        dy,
        targetCol: col,
        targetRow: row,
      });
    };

    const cleanupListeners = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      cleanupActiveDrag = null;
    };

    const handlePointerUp = () => {
      cleanupListeners();

      const currentDrag = dragState();
      if (isDragging && currentDrag) {
        suppressNextClick = true;
        setTimeout(() => {
          suppressNextClick = false;
        }, 0);
        desktopStore.moveItem(
          itemId,
          currentDrag.targetCol,
          currentDrag.targetRow,
          getAllItemIds()
        );
      }

      setDragState(null);
      desktopStore.setGhostVisible(false);
    };

    cleanupActiveDrag = cleanupListeners;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  onCleanup(() => {
    cleanupActiveDrag?.();
  });

  return {
    dragState,
    startIconDrag,
    shouldSuppressClick,
  };
}

/**
 * 바탕화면 뷰포트 크기 추적(ResizeObserver) 및 Ctrl+Wheel 그리드 배율 조절을 관리합니다.
 */
export function useDesktopViewport(
  getDesktopEl: () => HTMLElement | undefined,
  getItemCount: () => number
) {
  onMount(() => {
    const desktopEl = getDesktopEl();
    if (!desktopEl) return;

    const updateSize = () => {
      const el = getDesktopEl();
      if (!el) return;
      desktopStore.setViewportSize(el.clientWidth, el.clientHeight);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(desktopEl);

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('.os-window')) return;

      // 바탕화면 위에서의 Ctrl+Wheel은 브라우저 줌 대신 그리드 배율 조절로 처리
      e.preventDefault();

      if (!desktopStore.state.isDesktopFocused) {
        desktopStore.setDesktopFocused(true);
      }

      if (e.deltaY === 0) return;
      const direction: 1 | -1 = e.deltaY < 0 ? 1 : -1;
      desktopStore.zoomByStep(direction, getItemCount());
    };

    desktopEl.addEventListener('wheel', handleWheel, { passive: false });

    onCleanup(() => {
      resizeObserver.disconnect();
      desktopEl.removeEventListener('wheel', handleWheel);
    });
  });
}
