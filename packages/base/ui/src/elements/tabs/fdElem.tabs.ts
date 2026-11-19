import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { renderFdIcon } from '../common/fdElem.icon';

export type FdTabsVariant = 'pill' | 'underline' | 'segmented';
export type FdTabsSize = 'sm' | 'md';

export interface FdTabItem {
  value: string;
  label: string;
  count?: number;
  icon?: string;
  disabled?: boolean;
}

/**
 * Framework-agnostic tabs / segmented control Web Component (`<fd-tabs>`).
 * Supports `pill`, `underline`, and `segmented` variants, arrow-key navigation,
 * optional icons and counts, and `fd-change` custom events.
 */
@customElement('fd-tabs')
export class FdTabsElement extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      max-width: 100%;
      font-family: var(--fd-font-sans, inherit);
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    .fd-tabs {
      display: inline-flex;
      align-items: center;
      max-width: 100%;
      overflow-x: auto;
    }

    .fd-tabs--segmented {
      gap: 2px;
      padding: 3px;
      border-radius: var(--fd-radius-md, 8px);
      background: var(--fd-bg-elevated, #28211d);
      border: 1px solid var(--fd-border-subtle, rgba(196, 181, 165, 0.16));
    }

    .fd-tabs--pill {
      gap: 6px;
    }

    .fd-tabs--underline {
      gap: 4px;
      border-bottom: 1px solid var(--fd-border-subtle, rgba(196, 181, 165, 0.16));
    }

    .fd-tabs__tab {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--fd-text-muted, #9e9386);
      font-family: inherit;
      font-weight: 500;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      transition:
        background-color var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease),
        border-color var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease),
        color var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease);
    }

    .fd-tabs--sm .fd-tabs__tab {
      padding: 4px 10px;
      font-size: var(--fd-text-xs, 12px);
      border-radius: var(--fd-radius-sm, 6px);
    }

    .fd-tabs--md .fd-tabs__tab {
      padding: 6px 12px;
      font-size: var(--fd-text-sm, 14px);
      border-radius: var(--fd-radius-sm, 6px);
    }

    .fd-tabs--pill .fd-tabs__tab {
      border-radius: var(--fd-radius-pill, 999px);
    }

    .fd-tabs--underline .fd-tabs__tab {
      border-radius: var(--fd-radius-sm, 6px) var(--fd-radius-sm, 6px) 0 0;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
    }

    .fd-tabs__tab:hover:not(:disabled):not(.is-active) {
      color: var(--fd-text-primary, #f6f1ea);
    }

    .fd-tabs__tab:focus-visible {
      outline: 2px solid var(--fd-primary-focus, rgba(217, 119, 54, 0.68));
      outline-offset: 1px;
    }

    .fd-tabs__tab:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .fd-tabs--segmented .fd-tabs__tab.is-active {
      background: var(--fd-bg-surface, #1a1613);
      border-color: var(--fd-border-subtle, rgba(196, 181, 165, 0.16));
      color: var(--fd-text-primary, #f6f1ea);
      font-weight: 600;
    }

    .fd-tabs--pill .fd-tabs__tab.is-active {
      background: var(--fd-primary-subtle, rgba(217, 119, 54, 0.16));
      border-color: var(--fd-primary-border, rgba(217, 119, 54, 0.42));
      color: var(--fd-primary, #d97736);
      font-weight: 600;
    }

    .fd-tabs--underline .fd-tabs__tab.is-active {
      color: var(--fd-primary, #d97736);
      border-bottom-color: var(--fd-primary, #d97736);
      font-weight: 600;
    }

    .fd-tabs__count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: var(--fd-radius-pill, 999px);
      background: rgba(255, 255, 255, 0.08);
      font-size: 11px;
      line-height: 1;
      color: inherit;
    }
  `;

  @property({ type: Array })
  items: FdTabItem[] = [];

  @property({ type: String })
  value = '';

  @property({ type: String, reflect: true })
  variant: FdTabsVariant = 'segmented';

  @property({ type: String, reflect: true })
  size: FdTabsSize = 'md';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  private selectItem(item: FdTabItem): void {
    if (this.disabled || item.disabled || item.value === this.value) return;
    this.value = item.value;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    this.dispatchEvent(
      new CustomEvent('fd-change', {
        detail: { value: item.value, item },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleKeyDown(event: KeyboardEvent, currentIndex: number): void {
    if (this.disabled || this.items.length === 0) return;

    const enabledIndices = this.items
      .map((item, idx) => (!item.disabled ? idx : -1))
      .filter((idx) => idx >= 0);
    if (enabledIndices.length === 0) return;

    const pos = enabledIndices.indexOf(currentIndex);
    let targetIndex: number | undefined;

    if (event.key === 'ArrowRight') {
      targetIndex = enabledIndices[(pos + 1) % enabledIndices.length];
    } else if (event.key === 'ArrowLeft') {
      targetIndex = enabledIndices[(pos - 1 + enabledIndices.length) % enabledIndices.length];
    } else if (event.key === 'Home') {
      targetIndex = enabledIndices[0];
    } else if (event.key === 'End') {
      targetIndex = enabledIndices[enabledIndices.length - 1];
    }

    if (targetIndex === undefined) return;
    event.preventDefault();

    const targetItem = this.items[targetIndex];
    const buttons = this.shadowRoot?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[targetIndex]?.focus();
    if (targetItem) {
      this.selectItem(targetItem);
    }
  }

  override render() {
    const firstEnabledIndex = this.items.findIndex((item) => !item.disabled);
    const activeIndex = this.items.findIndex((item) => item.value === this.value && !item.disabled);
    const tabStopIndex = activeIndex >= 0 ? activeIndex : firstEnabledIndex;
    const iconSize = this.size === 'sm' ? 13 : 14;

    return html`
      <div
        class="fd-tabs fd-tabs--${this.variant} fd-tabs--${this.size}"
        role="tablist"
        aria-disabled=${this.disabled ? 'true' : 'false'}
      >
        ${this.items.map((item, idx) => {
          const isActive = item.value === this.value;
          const isItemDisabled = this.disabled || Boolean(item.disabled);

          return html`
            <button
              type="button"
              role="tab"
              class="fd-tabs__tab ${isActive ? 'is-active' : ''}"
              aria-selected=${isActive ? 'true' : 'false'}
              tabindex=${idx === tabStopIndex && !isItemDisabled ? 0 : -1}
              ?disabled=${isItemDisabled}
              @click=${() => this.selectItem(item)}
              @keydown=${(e: KeyboardEvent) => this.handleKeyDown(e, idx)}
            >
              ${item.icon ? renderFdIcon(item.icon, iconSize) : nothing}
              <span>${item.label}</span>
              ${item.count !== undefined
                ? html`<span class="fd-tabs__count">${item.count}</span>`
                : nothing}
            </button>
          `;
        })}
      </div>
    `;
  }
}
