import { Component, Show } from 'solid-js';
import { fd } from '@ferdy/ui';
import type { WindowInstance } from '../../../types/fdCore.window.type';
import { isExternalUrl, openInNewTab } from '../../../services/app/fdCore.app.store';
import { windowStore } from '../../../services/window/fdCore.window.store';
import { AppIcon } from '../../common/fdShell.app.icon';

export interface WindowTitlebarProps {
  window: WindowInstance;
  onPointerDown: (e: PointerEvent) => void;
  onDblClick: () => void;
}

export const WindowTitlebar: Component<WindowTitlebarProps> = (props) => {
  // 외부 URL 창을 브라우저 새 탭에서 열기
  const handleOpenExternalTab = (e: MouseEvent) => {
    e.stopPropagation();
    openInNewTab(props.window.appUrl);
  };

  return (
    <header
      class="os-window-titlebar"
      onPointerDown={props.onPointerDown}
      onDblClick={props.onDblClick}
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
            <fd.Icon name="external-link" size="xs" />
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
  );
};
