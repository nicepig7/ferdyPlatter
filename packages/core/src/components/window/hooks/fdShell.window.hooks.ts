import { createSignal, onCleanup, onMount } from 'solid-js';
import type { WindowInstance } from '../../../types/fdCore.window.type';
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  windowStore,
} from '../../../services/window/fdCore.window.store';

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export const RESIZE_DIRECTIONS: readonly ResizeDirection[] = [
  'n',
  's',
  'e',
  'w',
  'ne',
  'nw',
  'se',
  'sw',
];

/**
 * 브라우저 기본 새로고침 단축키(F5, Ctrl+R, Cmd+R, Ctrl+Shift+R 등)인지 판별합니다.
 */
function isReloadShortcut(e: KeyboardEvent): boolean {
  if (e.key === 'F5') return true;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') return true;
  return false;
}

/**
 * 창 타이틀바 드래그 이동 및 8방향 리사이징 포인터 인터랙션을 관리합니다.
 */
export function useWindowInteraction(getWindow: () => WindowInstance) {
  let cleanupPointerInteraction: (() => void) | null = null;

  // 드래그/리사이징 포인터 추적 시작 및 안전 종료(pointercancel/blur 포함)
  const startPointerInteraction = (onMove: (moveEvent: PointerEvent) => void) => {
    cleanupPointerInteraction?.();
    windowStore.setInteracting(true);

    const finishInteraction = () => {
      windowStore.setInteracting(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finishInteraction);
      window.removeEventListener('pointercancel', finishInteraction);
      window.removeEventListener('blur', finishInteraction);
      cleanupPointerInteraction = null;
    };

    cleanupPointerInteraction = finishInteraction;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', finishInteraction);
    window.addEventListener('pointercancel', finishInteraction);
    window.addEventListener('blur', finishInteraction);
  };

  onCleanup(() => {
    cleanupPointerInteraction?.();
  });

  // 타이틀바 드래그로 창 이동
  const handleTitleBarPointerDown = (e: PointerEvent) => {
    const win = getWindow();
    // 버튼 클릭이거나 최대화 상태면 드래그 무시
    if ((e.target as HTMLElement).closest('button')) return;
    if (win.isMaximized) return;

    e.preventDefault();
    windowStore.focusWindow(win.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = win.x;
    const initialY = win.y;

    startPointerInteraction((moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      windowStore.moveWindow(win.id, initialX + dx, initialY + dy);
    });
  };

  // 8방향 창 리사이징 핸들러
  const handleResizePointerDown = (dir: ResizeDirection) => (e: PointerEvent) => {
    const win = getWindow();
    if (win.isMaximized) return;
    e.preventDefault();
    e.stopPropagation();

    windowStore.focusWindow(win.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const minWidth = win.minWidth ?? MIN_WINDOW_WIDTH;
    const minHeight = win.minHeight ?? MIN_WINDOW_HEIGHT;
    const startRect = {
      x: win.x,
      y: win.y,
      width: win.width,
      height: win.height,
    };

    startPointerInteraction((moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newX = startRect.x;
      let newY = startRect.y;
      let newWidth = startRect.width;
      let newHeight = startRect.height;

      if (dir.includes('e')) {
        newWidth = Math.max(minWidth, startRect.width + dx);
      }
      if (dir.includes('s')) {
        newHeight = Math.max(minHeight, startRect.height + dy);
      }
      if (dir.includes('w')) {
        const proposedWidth = startRect.width - dx;
        if (proposedWidth >= minWidth) {
          newWidth = proposedWidth;
          newX = Math.max(0, startRect.x + dx);
        }
      }
      if (dir.includes('n')) {
        const proposedHeight = startRect.height - dy;
        if (proposedHeight >= minHeight) {
          newHeight = proposedHeight;
          newY = Math.max(0, startRect.y + dy);
        }
      }

      windowStore.resizeWindow(win.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    });
  };

  return {
    handleTitleBarPointerDown,
    handleResizePointerDown,
  };
}

/**
 * 창 내부 iframe 단독 새로고침 및 same-origin 포인터/키보드 이벤트 가로채기를 관리합니다.
 */
export function useWindowIframe(getWindow: () => WindowInstance) {
  const [canInterceptIframe, setCanInterceptIframe] = createSignal(false);
  let iframeRef: HTMLIFrameElement | undefined;

  const setIframeRef = (el: HTMLIFrameElement) => {
    iframeRef = el;
  };

  // 현재 창의 iframe만 단독 새로고침
  const reloadIframe = () => {
    if (!iframeRef) return;
    try {
      const contentWin = iframeRef.contentWindow;
      if (contentWin) {
        contentWin.location.reload();
        return;
      }
    } catch {
      // Cross-origin iframe: location.reload() is blocked by Same-Origin Policy
    }
    iframeRef.src = getWindow().appUrl;
  };

  // iframe 내부 문서에서 발생한 새로고침 단축키 가로채기
  const handleIframeKeyDown = (e: KeyboardEvent) => {
    if (!isReloadShortcut(e)) return;
    e.preventDefault();
    e.stopPropagation();
    windowStore.focusWindow(getWindow().id);
    reloadIframe();
  };

  // 비활성 상태인 same-origin iframe 내부 클릭 시 즉시 창 포커스 전환 (클릭 이벤트는 그대로 통과)
  const handleIframePointerDown = () => {
    const win = getWindow();
    if (!win.isFocused) {
      windowStore.focusWindow(win.id);
    }
  };

  // iframe 로드(및 리로드 완료) 시마다 내부 window에 키보드/포인터 리스너 등록
  const handleIframeLoad = () => {
    try {
      const contentWin = iframeRef?.contentWindow;
      if (!contentWin) {
        setCanInterceptIframe(false);
        return;
      }
      contentWin.removeEventListener('keydown', handleIframeKeyDown, true);
      contentWin.addEventListener('keydown', handleIframeKeyDown, true);
      contentWin.removeEventListener('pointerdown', handleIframePointerDown, true);
      contentWin.addEventListener('pointerdown', handleIframePointerDown, true);
      setCanInterceptIframe(true);
    } catch {
      // Cross-origin iframe: ignore SecurityError when attaching inner listeners
      setCanInterceptIframe(false);
    }
  };

  // 창 프레임(타이틀바 등)을 클릭하여 해당 창이 포커스된 상태에서 누른 새로고침 단축키 처리
  onMount(() => {
    const handleHostKeyDown = (e: KeyboardEvent) => {
      const win = getWindow();
      if (!win.isFocused || win.isMinimized) return;
      if (!isReloadShortcut(e)) return;

      e.preventDefault();
      e.stopPropagation();
      reloadIframe();
    };

    window.addEventListener('keydown', handleHostKeyDown, true);
    onCleanup(() => {
      window.removeEventListener('keydown', handleHostKeyDown, true);
      try {
        const contentWin = iframeRef?.contentWindow;
        contentWin?.removeEventListener('keydown', handleIframeKeyDown, true);
        contentWin?.removeEventListener('pointerdown', handleIframePointerDown, true);
      } catch {
        // Cross-origin iframe: ignore SecurityError on cleanup
      }
    });
  });

  return {
    canInterceptIframe,
    setIframeRef,
    handleIframeLoad,
  };
}
