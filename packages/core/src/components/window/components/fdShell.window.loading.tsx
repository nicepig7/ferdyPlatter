import { Component } from 'solid-js';
import type { WindowInstance } from '../../../types/fdCore.window.type';
import { appStore, getIconToneMeta } from '../../../services/app/fdCore.app.store';
import { AppIcon } from '../../common/fdShell.app.icon';

export interface WindowLoadingViewProps {
  window: WindowInstance;
  isLoading: boolean;
}

/**
 * 도메인 앱 iframe 로딩 및 리로드 중에 창 본문을 덮어 하얀 깜빡임 대신 표시되는 테마 일체형 로딩 뷰입니다.
 */
export const WindowLoadingView: Component<WindowLoadingViewProps> = (props) => {
  const manifest = () =>
    props.window.appId ? appStore.getApp(props.window.appId) : undefined;
  const toneMeta = () => getIconToneMeta(manifest()?.tone);
  const iconName = () => props.window.icon ?? manifest()?.icon ?? 'box';

  return (
    <div
      class="os-window-loading"
      classList={{ 'is-visible': props.isLoading }}
      aria-hidden={!props.isLoading}
    >
      <div class="os-window-loading-card">
        <div class="os-window-loading-visual">
          <span class="os-window-loading-ring" aria-hidden="true" />
          <span
            class="os-window-loading-icon"
            style={{
              '--os-loading-tile-fg': toneMeta().fg,
              '--os-loading-tile-grad-start': toneMeta().gradStart,
              '--os-loading-tile-grad-end': toneMeta().gradEnd,
              '--os-loading-tile-border': toneMeta().border,
            }}
          >
            <AppIcon icon={iconName()} size={22} />
          </span>
        </div>
        <div class="os-window-loading-text">
          <span class="os-window-loading-title">{props.window.title}</span>
          <span class="os-window-loading-sub">
            {props.window.loadingMessage ?? 'Loading application...'}
          </span>
        </div>
      </div>
    </div>
  );
};
