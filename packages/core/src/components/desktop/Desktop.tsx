import { Component, For } from 'solid-js';
import { FERDY_ASSETS } from '@ferdy/assets';
import { windowStore } from '../../store/windowStore';
import { WindowWrapper } from '../window/WindowWrapper';
import { DesktopIcon, type DesktopIconTone } from './DesktopIcon';
import './Desktop.css';

interface DesktopShortcut {
  id: string;
  title: string;
  icon: string;
  tone?: DesktopIconTone;
  appUrl: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const SHORTCUTS: DesktopShortcut[] = [
  {
    id: 'sample-app-1',
    title: 'Sample App',
    icon: FERDY_ASSETS.icons.sample,
    tone: 'primary',
    appUrl: '/apps/app-sample/',
  },
  {
    id: 'clock-app-1',
    title: 'Clock',
    icon: FERDY_ASSETS.icons.clock,
    tone: 'secondary',
    appUrl: '/apps/app-clock/',
    x: 780,
    y: 80,
    width: 340,
    height: 230,
  },
  {
    id: 'sample-app-2',
    title: 'Second Instance',
    icon: FERDY_ASSETS.icons.rocket,
    tone: 'primary',
    appUrl: '/apps/app-sample/?instance=2',
  },
];

export const Desktop: Component = () => {
  let instanceCounter = 3;

  const handleOpenShortcut = (shortcut: DesktopShortcut) => {
    windowStore.openWindow({
      id: shortcut.id,
      title: shortcut.title,
      icon: shortcut.icon,
      appUrl: shortcut.appUrl,
      x: shortcut.x,
      y: shortcut.y,
      width: shortcut.width,
      height: shortcut.height,
    });
  };

  const handleSpawnNewWindow = () => {
    const num = instanceCounter++;
    windowStore.openWindow({
      id: `sample-app-${num}`,
      title: `Sample App #${num}`,
      icon: FERDY_ASSETS.icons.sample,
      appUrl: `/apps/app-sample/?instance=${num}`,
    });
  };

  return (
    <main class="os-desktop">
      {/* 바탕화면 바로가기 아이콘 그리드 */}
      <section class="os-desktop-icons">
        <For each={SHORTCUTS}>
          {(item) => (
            <DesktopIcon
              title={item.title}
              icon={item.icon}
              tone={item.tone}
              onClick={() => handleOpenShortcut(item)}
              onDblClick={() => handleOpenShortcut(item)}
            />
          )}
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
