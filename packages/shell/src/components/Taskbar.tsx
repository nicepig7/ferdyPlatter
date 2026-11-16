import { Component, createSignal, For, onCleanup } from 'solid-js';
import { windowStore } from '../store/windowStore';

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
    const id = `sample-app-${Date.now()}`;
    windowStore.openWindow({
      id,
      title: `Sample App (${windowStore.state.windows.length + 1})`,
      appUrl: '/apps/app-sample/',
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
          <span class="os-start-logo">❖</span>
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
              <span class="os-taskbar-item-dot" />
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

