import {
  Component,
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import { FERDY_ASSETS } from '@ferdy/assets';
import { fd } from '@ferdy/ui';
import type { AppCategory, AppManifest } from '../../../types/fdCore.app.type';
import { appStore, getIconToneMeta } from '../../../services/app/fdCore.app.store';
import { desktopStore } from '../../../services/desktop/fdCore.desktop.store';
import { windowStore } from '../../../services/window/fdCore.window.store';
import { AppIcon } from '../../common/fdShell.app.icon';
import './fdShell.taskbar.start.css';

export interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: () => HTMLButtonElement | undefined;
}

type CategoryFilter = 'all' | AppCategory;

const CATEGORY_LABELS: Record<AppCategory, string> = {
  builtin: 'Builtin Apps',
  sample: 'Sample Apps',
};

export const StartMenu: Component<StartMenuProps> = (props) => {
  let menuRef: HTMLElement | undefined;
  let searchInputRef: HTMLInputElement | undefined;

  const [searchQuery, setSearchQuery] = createSignal('');
  const [selectedCategory, setSelectedCategory] = createSignal<CategoryFilter>('all');

  createEffect(() => {
    if (!props.isOpen) return;
    setSearchQuery('');
    setSelectedCategory('all');
    requestAnimationFrame(() => {
      searchInputRef?.focus();
    });
  });

  onMount(() => {
    const handleOutsidePointerDown = (e: PointerEvent) => {
      if (!props.isOpen) return;
      const target = e.target as Node | null;
      if (!target) return;
      if (menuRef?.contains(target)) return;
      if (props.triggerRef()?.contains(target)) return;
      props.onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!props.isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        props.onClose();
      }
    };

    const handleWindowBlur = () => {
      if (!props.isOpen) return;
      props.onClose();
    };

    window.addEventListener('pointerdown', handleOutsidePointerDown, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('blur', handleWindowBlur);

    onCleanup(() => {
      window.removeEventListener('pointerdown', handleOutsidePointerDown, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('blur', handleWindowBlur);
    });
  });

  const allApps = createMemo(() => Object.values(appStore.state.apps));

  const filterTabs = createMemo(() => {
    const apps = allApps();
    const builtinCount = apps.filter((app) => app.category === 'builtin').length;
    const sampleCount = apps.filter((app) => app.category === 'sample').length;

    return [
      { id: 'all' as CategoryFilter, label: 'All', count: apps.length },
      { id: 'builtin' as CategoryFilter, label: 'Builtin', count: builtinCount },
      { id: 'sample' as CategoryFilter, label: 'Sample', count: sampleCount },
    ];
  });

  const filteredApps = createMemo(() => {
    const category = selectedCategory();
    const query = searchQuery().trim().toLowerCase();

    return allApps().filter((app) => {
      if (category !== 'all' && app.category !== category) {
        return false;
      }
      if (!query) return true;
      return (
        app.title.toLowerCase().includes(query) ||
        (app.description ?? '').toLowerCase().includes(query) ||
        app.appId.toLowerCase().includes(query)
      );
    });
  });

  const groupedSections = createMemo(() => {
    const items = filteredApps();
    const category = selectedCategory();

    if (category !== 'all') {
      return items.length > 0
        ? [{ category, label: CATEGORY_LABELS[category], items }]
        : [];
    }

    const categories: AppCategory[] = ['builtin', 'sample'];
    return categories
      .map((cat) => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        items: items.filter((app) => app.category === cat),
      }))
      .filter((section) => section.items.length > 0);
  });

  const runningCountByApp = createMemo(() => {
    const counts: Record<string, number> = {};
    for (const win of windowStore.state.windows) {
      if (win.appId) {
        counts[win.appId] = (counts[win.appId] ?? 0) + 1;
      }
    }
    return counts;
  });

  const hasWindows = () => windowStore.state.windows.length > 0;
  const hasVisibleWindows = () =>
    windowStore.state.windows.some((win) => !win.isMinimized);
  const allMinimized = () => hasWindows() && !hasVisibleWindows();

  const handleLaunchApp = (app: AppManifest) => {
    appStore.launchApp(app.appId);
    props.onClose();
  };

  const handleLaunchNewInstance = (app: AppManifest, e: MouseEvent) => {
    e.stopPropagation();
    const existingForApp = windowStore.state.windows.filter(
      (win) => win.appId === app.appId
    );

    if (existingForApp.length === 0) {
      appStore.launchApp(app.appId);
    } else {
      const nextNum = existingForApp.length + 1;
      appStore.launchApp(app.appId, {
        windowId: `${app.appId}-${Date.now()}`,
        title: `${app.title} (${nextNum})`,
        queryParams: { instance: nextNum },
      });
    }
    props.onClose();
  };

  const handleTileWindows = () => {
    windowStore.tileWindows(desktopStore.getViewportSize());
    props.onClose();
  };

  const handleCascadeWindows = () => {
    windowStore.cascadeWindows(desktopStore.getViewportSize());
    props.onClose();
  };

  const handleToggleMinimizeAll = () => {
    windowStore.toggleMinimizeAllWindows();
    props.onClose();
  };

  const handleCloseAllWindows = () => {
    windowStore.closeAllWindows();
    props.onClose();
  };

  return (
    <Show when={props.isOpen}>
      <section
        ref={menuRef}
        class="os-start-menu"
        role="dialog"
        aria-label="Start Menu"
      >
        {/* 상단 헤더: 브랜드 정보 + 검색 + 카테고리 필터 */}
        <header class="os-start-header">
          <div class="os-start-brand">
            <div class="os-start-brand-info">
              <span class="os-start-brand-logo">
                <AppIcon icon={FERDY_ASSETS.paths.logoSvg} size={18} />
              </span>
              <span class="os-start-brand-name">Ferdy Platter</span>
              <fd.Badge variant="primary" class="os-start-version-badge">
                v0.1.7
              </fd.Badge>
            </div>
            <span class="os-start-window-count">
              열린 창 {windowStore.state.windows.length}개
            </span>
          </div>

          <fd.TextField
            ref={(el) => {
              searchInputRef = el;
            }}
            size="sm"
            leftIcon="search"
            placeholder="앱 이름 또는 설명 검색..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            clearable
            onClear={() => setSearchQuery('')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredApps().length > 0) {
                handleLaunchApp(filteredApps()[0]);
              }
            }}
          />

          <div class="os-start-tabs" role="tablist" aria-label="앱 카테고리 필터">
            <For each={filterTabs()}>
              {(tab) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory() === tab.id}
                  class="os-start-tab"
                  classList={{ 'is-active': selectedCategory() === tab.id }}
                  onClick={() => setSelectedCategory(tab.id)}
                >
                  <span>{tab.label}</span>
                  <span class="os-start-tab-count">{tab.count}</span>
                </button>
              )}
            </For>
          </div>
        </header>

        {/* 중앙: 등록된 앱 목록 */}
        <div class="os-start-body">
          <Show
            when={groupedSections().length > 0}
            fallback={
              <div class="os-start-empty">
                <fd.Icon name="search-x" size="lg" />
                <span>일치하는 앱이 없습니다.</span>
              </div>
            }
          >
            <For each={groupedSections()}>
              {(section) => (
                <div class="os-start-section">
                  <div class="os-start-section-title">{section.label}</div>
                  <div class="os-start-app-list">
                    <For each={section.items}>
                      {(app) => {
                        const toneMeta = () => getIconToneMeta(app.tone);
                        const runningCount = () => runningCountByApp()[app.appId] ?? 0;

                        return (
                          <div class="os-start-app-item">
                            <button
                              type="button"
                              class="os-start-app-main"
                              onClick={() => handleLaunchApp(app)}
                            >
                              <span
                                class="os-start-app-icon"
                                style={{
                                  '--os-start-tile-fg': toneMeta().fg,
                                  '--os-start-tile-grad-start': toneMeta().gradStart,
                                  '--os-start-tile-grad-end': toneMeta().gradEnd,
                                  '--os-start-tile-border': toneMeta().border,
                                }}
                              >
                                <AppIcon icon={app.icon} size={18} />
                              </span>

                              <span class="os-start-app-info">
                                <span class="os-start-app-title-row">
                                  <span class="os-start-app-title">{app.title}</span>
                                  <Show when={runningCount() > 0}>
                                    <span
                                      class="os-start-app-running"
                                      title={`실행 중인 창 ${runningCount()}개`}
                                    >
                                      <span class="os-start-app-running-dot" />
                                      {runningCount()}
                                    </span>
                                  </Show>
                                </span>
                                <Show when={app.description}>
                                  <span class="os-start-app-desc">{app.description}</span>
                                </Show>
                              </span>
                            </button>

                            <button
                              type="button"
                              class="os-start-app-new-btn"
                              title="새 창(인스턴스)으로 열기"
                              aria-label={`${app.title} 새 창으로 열기`}
                              onClick={(e) => handleLaunchNewInstance(app, e)}
                            >
                              <fd.Icon name="plus" size={14} />
                            </button>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </Show>
        </div>

        {/* 하단 푸터: 창 일괄 제어 빠른 액션 */}
        <footer class="os-start-footer">
          <button
            type="button"
            class="os-start-action-btn"
            disabled={!hasVisibleWindows()}
            onClick={handleTileWindows}
            title="열린 창을 격자로 분할 배치"
          >
            <fd.Icon name="layout-grid" size={13} />
            <span>바둑판</span>
          </button>

          <button
            type="button"
            class="os-start-action-btn"
            disabled={!hasVisibleWindows()}
            onClick={handleCascadeWindows}
            title="열린 창을 계단식으로 정렬"
          >
            <fd.Icon name="layers" size={13} />
            <span>계단식</span>
          </button>

          <button
            type="button"
            class="os-start-action-btn"
            classList={{ 'is-active': allMinimized() }}
            disabled={!hasWindows()}
            onClick={handleToggleMinimizeAll}
            title={
              allMinimized()
                ? '최소화된 창 복원'
                : '열린 창 모두 최소화 (바탕화면 보기)'
            }
          >
            <fd.Icon name="minimize-2" size={13} />
            <span>{allMinimized() ? '복원' : '최소화'}</span>
          </button>

          <button
            type="button"
            class="os-start-action-btn is-danger"
            disabled={!hasWindows()}
            onClick={handleCloseAllWindows}
            title="열려 있는 모든 창 닫기"
          >
            <fd.Icon name="x" size={13} />
            <span>모두 닫기</span>
          </button>
        </footer>
      </section>
    </Show>
  );
};
