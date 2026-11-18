import { Component, For } from 'solid-js';
import type { WindowInstance } from '../../../types/fdCore.window.type';
import { appStore, getIconToneMeta } from '../../../services/app/fdCore.app.store';
import { AppIcon } from '../../common/fdShell.app.icon';

export interface WindowEmptyViewProps {
  window: WindowInstance;
}

/**
 * 앱이 지정되지 않은 빈 창(`appUrl === ''`) 내부에 표시되는 미니멀 빈 캔버스 뷰입니다.
 * 앱 아이콘을 선택하면 현재 창 인스턴스 상태를 유지한 채 해당 앱으로 즉시 전환(replaceWindow)합니다.
 */
export const WindowEmptyView: Component<WindowEmptyViewProps> = (props) => {
  return (
    <div class="os-window-empty">
      <p class="os-window-empty-hint">Empty Window — 실행할 앱을 선택하세요</p>

      <div class="os-window-empty-apps" role="list" aria-label="실행 가능한 앱 목록">
        <For each={appStore.getAppList()}>
          {(app) => {
            const toneMeta = () => getIconToneMeta(app.tone);

            return (
              <button
                type="button"
                class="os-window-empty-item"
                title={app.description ?? app.title}
                onClick={() => appStore.launchAppInWindow(props.window.id, app.appId)}
              >
                <span
                  class="os-window-empty-item-icon"
                  style={{
                    '--os-empty-tile-fg': toneMeta().fg,
                    '--os-empty-tile-grad-start': toneMeta().gradStart,
                    '--os-empty-tile-grad-end': toneMeta().gradEnd,
                    '--os-empty-tile-border': toneMeta().border,
                  }}
                >
                  <AppIcon icon={app.icon} size={20} />
                </span>
                <span class="os-window-empty-item-label">{app.title}</span>
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
};
