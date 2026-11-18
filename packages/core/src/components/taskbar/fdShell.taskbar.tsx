import { Component, createSignal, For, onCleanup, Show } from 'solid-js';
import { FERDY_ASSETS } from '@ferdy/assets';
import { fd } from '@ferdy/ui';
import { desktopStore } from '../../services/desktop/fdCore.desktop.store';
import { windowStore } from '../../services/window/fdCore.window.store';
import { AppIcon } from '../common/fdShell.app.icon';
import { StartMenu } from './components/fdShell.taskbar.start';
import './fdShell.taskbar.css';

function formatTaskbarTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const Taskbar: Component = () => {
  let startBtnRef: HTMLButtonElement | undefined;
  const [timeString, setTimeString] = createSignal(formatTaskbarTime());
  const [isStartOpen, setIsStartOpen] = createSignal(false);

  const timer = setInterval(() => {
    setTimeString(formatTaskbarTime());
  }, 10000);

  onCleanup(() => clearInterval(timer));

  const hasWindows = () => windowStore.state.windows.length > 0;
  const hasVisibleWindows = () => windowStore.state.windows.some((w) => !w.isMinimized);
  const allMinimized = () => hasWindows() && !hasVisibleWindows();

  const toggleStartMenu = () => {
    setIsStartOpen((prev) => !prev);
  };

  return (
    <footer class="os-taskbar">
      {/* 좌측 시작/앱 런처 버튼 및 시작 메뉴 팝업 */}
      <div class="os-taskbar-start">
        <StartMenu
          isOpen={isStartOpen()}
          onClose={() => setIsStartOpen(false)}
          triggerRef={() => startBtnRef}
        />
        <button
          ref={startBtnRef}
          type="button"
          class="os-start-btn"
          classList={{ 'is-active': isStartOpen() }}
          aria-expanded={isStartOpen()}
          onClick={toggleStartMenu}
          title="시작 메뉴 열기 (앱 런처)"
        >
          <span class="os-start-logo">
            <AppIcon icon={FERDY_ASSETS.paths.logoSvg} size={18} />
          </span>
          <span>fdPlatter</span>
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
        <div class="os-tray-actions">
          <button
            type="button"
            class="os-tray-btn"
            disabled={!hasVisibleWindows()}
            onClick={() => windowStore.tileWindows(desktopStore.getViewportSize())}
            title="바둑판식 창 정렬 (Tile)"
          >
            <fd.Icon name="layout-grid" size={14} />
          </button>
          <button
            type="button"
            class="os-tray-btn"
            disabled={!hasVisibleWindows()}
            onClick={() => windowStore.cascadeWindows(desktopStore.getViewportSize())}
            title="계단식 창 정렬 (Cascade)"
          >
            <fd.Icon name="layers" size={14} />
          </button>
          <button
            type="button"
            class="os-tray-btn"
            classList={{ 'is-active': allMinimized() }}
            disabled={!hasWindows()}
            onClick={() => windowStore.toggleMinimizeAllWindows()}
            title={
              allMinimized()
                ? '창 복원 (바탕화면 보기 해제)'
                : '모두 최소화 (바탕화면 보기)'
            }
          >
            <fd.Icon name="minimize-2" size={14} />
          </button>
        </div>
        <span class="os-tray-clock">{timeString()}</span>
      </div>
    </footer>
  );
};
