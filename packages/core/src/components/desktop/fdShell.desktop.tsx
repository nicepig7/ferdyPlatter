import { Component, For, Show } from 'solid-js';
import { FERDY_ASSETS } from '@ferdy/assets';
import { appStore } from '../../services/app/fdStore.app';
import { windowStore } from '../../services/window/fdStore.window';
import { WindowWrapper } from '../window/fdShell.windowWrapper';
import { DesktopIcon } from './fdShell.desktopIcon';
import './fdShell.desktop.css';

export const Desktop: Component = () => {
  let instanceCounter = 3;

  const handleSpawnNewWindow = () => {
    const num = instanceCounter++;
    appStore.launchApp('app-sample', {
      windowId: `sample-app-${num}`,
      title: `Sample App #${num}`,
      queryParams: { instance: num },
    });
  };

  return (
    <main
      class="os-desktop"
      onPointerDown={(e) => {
        if (!(e.target as HTMLElement).closest('.os-window')) {
          windowStore.blurAllWindows();
        }
      }}
    >
      {/* 바탕화면 바로가기 아이콘 그리드 (appStore.state.shortcuts 구독) */}
      <section class="os-desktop-icons">
        <For each={appStore.state.shortcuts}>
          {(item) => {
            const resolved = () => appStore.resolveShortcut(item);
            return (
              <Show when={resolved()}>
                {(shortcut) => (
                  <DesktopIcon
                    title={shortcut().title}
                    icon={shortcut().icon}
                    tone={shortcut().tone}
                    onClick={() => appStore.openShortcut(item)}
                    onDblClick={() => appStore.openShortcut(item)}
                  />
                )}
              </Show>
            );
          }}
        </For>

        <DesktopIcon
          title="New Window"
          icon={FERDY_ASSETS.icons.plus}
          tone="neutral"
          iconSize={28}
          onClick={handleSpawnNewWindow}
        />
      </section>

      {/* 활성 창 레이어 (Store의 windows 배열을 Fine-grained 구독) */}
      <section class="os-window-layer">
        <For each={windowStore.state.windows}>
          {(win) => <WindowWrapper window={win} />}
        </For>
      </section>
    </main>
  );
};
