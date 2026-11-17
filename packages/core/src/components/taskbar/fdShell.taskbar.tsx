import { Component, createSignal, For, onCleanup, Show } from 'solid-js';
import { FERDY_ASSETS } from '@ferdy/assets';
import { appStore } from '../../services/app/fdStore.app';
import { windowStore } from '../../services/window/fdStore.window';
import { AppIcon } from '../common/fdShell.appIcon';
import './fdShell.taskbar.css';

export const Taskbar: Component = () => {
  const [timeString, setTimeString] = createSignal(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const timer = setInterval(() => {
    setTimeString(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }, 10000);

  onCleanup(() => clearInterval(timer));

  const handleLauncherClick = () => {
    const nextIdx = windowStore.state.windows.length + 1;
    appStore.launchApp('app-sample', {
      windowId: `sample-app-${Date.now()}`,
      title: `Sample App (${nextIdx})`,
      queryParams: { instance: nextIdx },
    });
  };

  return (
    <footer class="os-taskbar">
      {/* 좌측 시작/앱 런처 버튼 */}
      <div class="os-taskbar-start">
        <button
          type="button"
          class="os-start-btn"
          onClick={handleLauncherClick}
          title="Launch new Sample App instance"
        >
          <span class="os-start-logo">{FERDY_ASSETS.logoSymbol}</span>
          <span>FerdyOS</span>
        </button>
      </div>

      {/* 중앙: 열린 창 목록 구독 */}
      <div class="os-taskbar-windows">
        <For each={windowStore.state.windows}>
          {(win) => (
            <button
              type="button"
              class="os-taskbar-item"
              classList={{
                'is-active': win.isFocused && !win.isMinimized,
                'is-minimized': win.isMinimized,
              }}
              onClick={() => windowStore.toggleTaskbarWindow(win.id)}
            >
              <Show
                when={win.icon}
                fallback={<span class="os-taskbar-item-dot" />}
              >
                {(icon) => (
                  <span class="os-taskbar-item-icon">
                    <AppIcon icon={icon()} size={15} />
                  </span>
                )}
              </Show>
              <span class="os-taskbar-item-title">{win.title}</span>
              <span class="os-taskbar-item-z">z:{win.zIndex}</span>
            </button>
          )}
        </For>
      </div>

      {/* 우측 시스템 트레이 영역 */}
      <div class="os-taskbar-tray">
        <span class="os-tray-status">
          Windows: {windowStore.state.windows.length}
        </span>
        <span class="os-tray-clock">{timeString()}</span>
      </div>
    </footer>
  );
};
