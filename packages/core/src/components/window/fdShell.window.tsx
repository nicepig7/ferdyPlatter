import { Component, For, Show } from 'solid-js';
import type { WindowInstance } from '../../types/fdCore.window.type';
import { windowStore } from '../../services/window/fdCore.window.store';
import { WindowEmptyView } from './components/fdShell.window.empty';
import { WindowLoadingView } from './components/fdShell.window.loading';
import { WindowTitlebar } from './components/fdShell.window.titlebar';
import {
  RESIZE_DIRECTIONS,
  useWindowIframe,
  useWindowInteraction,
} from './hooks/fdShell.window.hooks';
import './fdShell.window.css';

interface WindowWrapperProps {
  window: WindowInstance;
}

export const WindowWrapper: Component<WindowWrapperProps> = (props) => {
  const { handleTitleBarPointerDown, handleResizePointerDown } =
    useWindowInteraction(() => props.window);
  const { canInterceptIframe, isIframeLoading, setIframeRef, handleIframeLoad } =
    useWindowIframe(() => props.window);

  return (
    <div
      class="os-window"
      classList={{
        'is-focused': props.window.isFocused,
        'is-minimized': props.window.isMinimized,
        'is-maximized': props.window.isMaximized,
        'is-snapped': Boolean(props.window.snapZone),
      }}
      style={{
        transform: props.window.isMaximized
          ? 'translate3d(0px, 0px, 0)'
          : `translate3d(${props.window.x}px, ${props.window.y}px, 0)`,
        width: props.window.isMaximized ? '100%' : `${props.window.width}px`,
        height: props.window.isMaximized ? '100%' : `${props.window.height}px`,
        'z-index': props.window.zIndex,
      }}
      onPointerDown={() => {
        if (!props.window.isFocused) {
          windowStore.focusWindow(props.window.id);
        }
      }}
    >
      {/* 상단 타이틀바 (드래그 핸들) */}
      <WindowTitlebar
        window={props.window}
        onPointerDown={handleTitleBarPointerDown}
        onDblClick={() => windowStore.toggleMaximizeWindow(props.window.id)}
      />

      {/* 본문 영역: 격리된 iframe 앱 컨테이너 또는 빈 창 내장 런처 뷰 */}
      <div class="os-window-body">
        <Show
          when={props.window.appUrl}
          fallback={<WindowEmptyView window={props.window} />}
        >
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

          <WindowLoadingView
            window={props.window}
            isLoading={isIframeLoading() || Boolean(props.window.isLoading)}
          />

          <iframe
            ref={setIframeRef}
            class="os-window-iframe"
            classList={{ 'is-loading': isIframeLoading() }}
            data-window-id={props.window.id}
            src={props.window.appUrl}
            title={props.window.title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            onLoad={handleIframeLoad}
          />
        </Show>
      </div>

      {/* 8방향 리사이징 핸들 (최대화 상태가 아닐 때만 표시) */}
      <Show when={!props.window.isMaximized}>
        <For each={RESIZE_DIRECTIONS}>
          {(dir) => (
            <div
              class={`resize-handle resize-${dir}`}
              onPointerDown={handleResizePointerDown(dir)}
            />
          )}
        </For>
      </Show>
    </div>
  );
};
