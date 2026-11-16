import { Component, createSignal, Show } from 'solid-js';
import type { WindowInstance } from '../types/window';
import { windowStore } from '../store/windowStore';

interface WindowWrapperProps {
  window: WindowInstance;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const MIN_WIDTH = 320;
const MIN_HEIGHT = 220;

export const WindowWrapper: Component<WindowWrapperProps> = (props) => {
  const [isInteracting, setIsInteracting] = createSignal(false);

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
    };

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
        newWidth = Math.max(MIN_WIDTH, startRect.width + dx);
      }
      if (dir.includes('s')) {
        newHeight = Math.max(MIN_HEIGHT, startRect.height + dy);
      }
      if (dir.includes('w')) {
        const proposedWidth = startRect.width - dx;
        if (proposedWidth >= MIN_WIDTH) {
          newWidth = proposedWidth;
          newX = Math.max(0, startRect.x + dx);
        }
      }
      if (dir.includes('n')) {
        const proposedHeight = startRect.height - dy;
        if (proposedHeight >= MIN_HEIGHT) {
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
    };

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
          <span class="os-window-dot" />
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
            &#8211;
          </button>
          <button
            type="button"
            class="win-btn win-btn-maximize"
            title="Maximize / Restore"
            onClick={(e) => {
              e.stopPropagation();
              windowStore.toggleMaximizeWindow(props.window.id);
            }}
          >
            &#9633;
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
            &#10005;
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
          class="os-window-iframe"
          src={props.window.appUrl}
          title={props.window.title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
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

