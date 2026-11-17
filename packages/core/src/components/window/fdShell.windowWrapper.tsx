import { Component, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { fd } from '@ferdy/ui';
import type { WindowInstance } from '../../types/fdType.window';
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
  const [isInteracting, setIsInteracting] = createSignal(false);
  let iframeRef: HTMLIFrameElement | undefined;
  let cleanupPointerInteraction: (() => void) | null = null;

  // 현재 창의 iframe만 단독 새로고침
  const reloadIframe = () => {
    const contentWin = iframeRef?.contentWindow;
    if (!contentWin) return;
    contentWin.location.reload();
  };

  // iframe 내부 문서에서 발생한 새로고침 단축키 가로채기
  const handleIframeKeyDown = (e: KeyboardEvent) => {
    if (!isReloadShortcut(e)) return;
    e.preventDefault();
    e.stopPropagation();
    windowStore.focusWindow(props.window.id);
    reloadIframe();
  };

  // iframe 로드(및 리로드 완료) 시마다 내부 window에 키보드 리스너 등록
  const handleIframeLoad = () => {
    const contentWin = iframeRef?.contentWindow;
    if (!contentWin) return;
    contentWin.removeEventListener('keydown', handleIframeKeyDown, true);
    contentWin.addEventListener('keydown', handleIframeKeyDown, true);
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
      iframeRef?.contentWindow?.removeEventListener('keydown', handleIframeKeyDown, true);
      cleanupPointerInteraction?.();
    });
  });

  // 타이틀바 드래그로 창 이동
  const handleTitleBarPointerDown = (e: PointerEvent) => {
    // 버튼 클릭이거나 최대화 상태면 드래그 무시
    if ((e.target as HTMLElement).closest('button')) return;
    if (props.window.isMaximized) return;

    e.preventDefault();
    windowStore.focusWindow(props.window.id);
    setIsInteracting(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = props.window.x;
    const initialY = props.window.y;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      windowStore.moveWindow(props.window.id, initialX + dx, initialY + dy);
    };

    const onPointerUp = () => {
      setIsInteracting(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      cleanupPointerInteraction = null;
    };

    cleanupPointerInteraction = onPointerUp;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // 8방향 창 리사이징 핸들러
  const handleResizePointerDown = (dir: ResizeDirection) => (e: PointerEvent) => {
    if (props.window.isMaximized) return;
    e.preventDefault();
    e.stopPropagation();

    windowStore.focusWindow(props.window.id);
    setIsInteracting(true);

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

    const onPointerMove = (moveEvent: PointerEvent) => {
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
    };

    const onPointerUp = () => {
      setIsInteracting(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      cleanupPointerInteraction = null;
    };

    cleanupPointerInteraction = onPointerUp;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
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
      onPointerDown={() => windowStore.focusWindow(props.window.id)}
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
          드래그/리사이즈 중이거나 비활성 창일 때 투명 보호막을 씌워
          iframe이 마우스 이벤트를 가로채거나 클릭 포커스를 뺏는 현상을 방지합니다.
        */}
        <Show when={isInteracting() || !props.window.isFocused}>
          <div
            class="os-window-iframe-shield"
            onPointerDown={() => windowStore.focusWindow(props.window.id)}
          />
        </Show>

        <iframe
          ref={iframeRef}
          class="os-window-iframe"
          src={props.window.appUrl}
          title={props.window.title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
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
