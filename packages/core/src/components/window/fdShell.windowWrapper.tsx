import { Component, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { FERDY_ASSETS } from '@ferdy/assets';
import { fd } from '@ferdy/ui';
import type { WindowInstance } from '../../types/fdType.window';
import { isExternalUrl, openInNewTab } from '../../services/app/fdStore.app';
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  windowStore,
} from '../../services/window/fdStore.window';
import { AppIcon } from '../common/fdShell.appIcon';
import './fdShell.windowWrapper.css';

interface WindowWrapperProps {
  window: WindowInstance;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/**
 * 브라우저 기본 새로고침 단축키(F5, Ctrl+R, Cmd+R, Ctrl+Shift+R 등)인지 판별합니다.
 */
function isReloadShortcut(e: KeyboardEvent): boolean {
  if (e.key === 'F5') return true;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') return true;
  return false;
}

export const WindowWrapper: Component<WindowWrapperProps> = (props) => {
  const [canInterceptIframe, setCanInterceptIframe] = createSignal(false);
  let iframeRef: HTMLIFrameElement | undefined;
  let cleanupPointerInteraction: (() => void) | null = null;

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
    iframeRef.src = props.window.appUrl;
  };

  // 외부 URL 창을 브라우저 새 탭에서 열기
  const handleOpenExternalTab = (e: MouseEvent) => {
    e.stopPropagation();
    openInNewTab(props.window.appUrl);
  };

  // iframe 내부 문서에서 발생한 새로고침 단축키 가로채기
  const handleIframeKeyDown = (e: KeyboardEvent) => {
    if (!isReloadShortcut(e)) return;
    e.preventDefault();
    e.stopPropagation();
    windowStore.focusWindow(props.window.id);
    reloadIframe();
  };

  // 비활성 상태인 same-origin iframe 내부 클릭 시 즉시 창 포커스 전환 (클릭 이벤트는 그대로 통과)
  const handleIframePointerDown = () => {
    if (!props.window.isFocused) {
      windowStore.focusWindow(props.window.id);
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
      if (!props.window.isFocused || props.window.isMinimized) return;
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
      cleanupPointerInteraction?.();
    });
  });

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

  // 타이틀바 드래그로 창 이동
  const handleTitleBarPointerDown = (e: PointerEvent) => {
    // 버튼 클릭이거나 최대화 상태면 드래그 무시
    if ((e.target as HTMLElement).closest('button')) return;
    if (props.window.isMaximized) return;

    e.preventDefault();
    windowStore.focusWindow(props.window.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = props.window.x;
    const initialY = props.window.y;

    startPointerInteraction((moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      windowStore.moveWindow(props.window.id, initialX + dx, initialY + dy);
    });
  };

  // 8방향 창 리사이징 핸들러
  const handleResizePointerDown = (dir: ResizeDirection) => (e: PointerEvent) => {
    if (props.window.isMaximized) return;
    e.preventDefault();
    e.stopPropagation();

    windowStore.focusWindow(props.window.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const minWidth = props.window.minWidth ?? MIN_WINDOW_WIDTH;
    const minHeight = props.window.minHeight ?? MIN_WINDOW_HEIGHT;
    const startRect = {
      x: props.window.x,
      y: props.window.y,
      width: props.window.width,
      height: props.window.height,
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

      windowStore.resizeWindow(props.window.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    });
  };

  return (
    <div
      class="os-window"
      classList={{
        'is-focused': props.window.isFocused,
        'is-minimized': props.window.isMinimized,
        'is-maximized': props.window.isMaximized,
      }}
      style={{
        transform: props.window.isMaximized
          ? 'translate3d(0px, 0px, 0)'
          : `translate3d(${props.window.x}px, ${props.window.y}px, 0)`,
        width: props.window.isMaximized ? '100%' : `${props.window.width}px`,
        height: props.window.isMaximized ? 'calc(100% - 48px)' : `${props.window.height}px`,
        'z-index': props.window.zIndex,
      }}
      onPointerDown={() => {
        if (!props.window.isFocused) {
          windowStore.focusWindow(props.window.id);
        }
      }}
    >
      {/* 상단 타이틀바 (드래그 핸들) */}
      <header
        class="os-window-titlebar"
        onPointerDown={handleTitleBarPointerDown}
        onDblClick={() => windowStore.toggleMaximizeWindow(props.window.id)}
      >
        <div class="os-window-title">
          <Show
            when={props.window.icon}
            fallback={<span class="os-window-dot" />}
          >
            {(icon) => (
              <span class="os-window-app-icon">
                <AppIcon icon={icon()} size={15} />
              </span>
            )}
          </Show>
          <span class="os-window-title-text">{props.window.title}</span>
        </div>
        <div class="os-window-controls">
          <Show when={isExternalUrl(props.window.appUrl)}>
            <button
              type="button"
              class="win-btn win-btn-external"
              title="Open in new tab"
              onClick={handleOpenExternalTab}
            >
              <fd.Icon name={FERDY_ASSETS.icons.externalLink} size="xs" />
            </button>
          </Show>
          <button
            type="button"
            class="win-btn win-btn-minimize"
            title="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              windowStore.minimizeWindow(props.window.id);
            }}
          >
            <fd.Icon name="minus" size="sm" />
          </button>
          <button
            type="button"
            class="win-btn win-btn-maximize"
            title={props.window.isMaximized ? 'Restore' : 'Maximize'}
            onClick={(e) => {
              e.stopPropagation();
              windowStore.toggleMaximizeWindow(props.window.id);
            }}
          >
            <fd.Icon name={props.window.isMaximized ? 'copy' : 'square'} size="xs" />
          </button>
          <button
            type="button"
            class="win-btn win-btn-close"
            title="Close"
            onClick={(e) => {
              e.stopPropagation();
              windowStore.closeWindow(props.window.id);
            }}
          >
            <fd.Icon name="x" size="sm" />
          </button>
        </div>
      </header>

      {/* 본문 영역: 격리된 iframe 앱 컨테이너 */}
      <div class="os-window-body">
        {/*
          드래그/리사이즈 중이거나, 포인터 리스너를 직접 붙일 수 없는 cross-origin 비활성 창일 때
          투명 보호막을 씌워 iframe이 마우스 이벤트를 가로채거나 드래그가 끊기는 현상을 방지합니다.
        */}
        <Show when={windowStore.state.isInteracting || (!props.window.isFocused && !canInterceptIframe())}>
          <div
            class="os-window-iframe-shield"
            onPointerDown={(e) => {
              e.stopPropagation();
              if (!props.window.isFocused) {
                windowStore.focusWindow(props.window.id);
              }
            }}
          />
        </Show>

        <iframe
          ref={iframeRef}
          class="os-window-iframe"
          src={props.window.appUrl}
          title={props.window.title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
          onLoad={handleIframeLoad}
        />
      </div>

      {/* 8방향 리사이징 핸들 (최대화 상태가 아닐 때만 표시) */}
      <Show when={!props.window.isMaximized}>
        <div class="resize-handle resize-n" onPointerDown={handleResizePointerDown('n')} />
        <div class="resize-handle resize-s" onPointerDown={handleResizePointerDown('s')} />
        <div class="resize-handle resize-e" onPointerDown={handleResizePointerDown('e')} />
        <div class="resize-handle resize-w" onPointerDown={handleResizePointerDown('w')} />
        <div class="resize-handle resize-ne" onPointerDown={handleResizePointerDown('ne')} />
        <div class="resize-handle resize-nw" onPointerDown={handleResizePointerDown('nw')} />
        <div class="resize-handle resize-se" onPointerDown={handleResizePointerDown('se')} />
        <div class="resize-handle resize-sw" onPointerDown={handleResizePointerDown('sw')} />
      </Show>
    </div>
  );
};
