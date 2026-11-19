import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { renderFdIcon } from '../common/fdElem.icon';

export type FdSelectSize = 'sm' | 'md';

export interface FdSelectOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

/**
 * Framework-agnostic custom select dropdown Web Component (`<fd-select>`).
 * Supports keyboard navigation (`ArrowUp`, `ArrowDown`, `Home`, `End`, `Enter`, `Escape`),
 * outside-click dismissal, option icons, and `fd-change` custom events.
 */
@customElement('fd-select')
export class FdSelectElement extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: inline-block;
      position: relative;
      min-width: 0;
      font-family: var(--fd-font-sans, inherit);
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    .fd-select {
      position: relative;
      width: 100%;
    }

    .fd-select__trigger {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
      min-width: 0;
      border-radius: var(--fd-radius-md, 8px);
      background: var(--fd-bg-elevated, #28211d);
      border: 1px solid var(--fd-border-subtle, rgba(196, 181, 165, 0.16));
      color: var(--fd-text-primary, #f6f1ea);
      font-family: inherit;
      font-weight: 500;
      cursor: pointer;
      user-select: none;
      transition:
        border-color var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease),
        background-color var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease);
    }

    .fd-select__trigger--sm {
      height: var(--fd-control-height-sm, 30px);
      padding: 0 8px 0 10px;
      font-size: var(--fd-text-sm, 14px);
      border-radius: var(--fd-radius-sm, 6px);
    }

    .fd-select__trigger--md {
      height: var(--fd-control-height-md, 36px);
      padding: 0 10px 0 12px;
      font-size: var(--fd-text-base, 16px);
    }

    .fd-select__trigger:hover:not(:disabled) {
      border-color: var(--fd-border-strong, rgba(196, 181, 165, 0.32));
    }

    .fd-select__trigger:focus-visible {
      outline: none;
      border-color: var(--fd-primary-border, rgba(217, 119, 54, 0.42));
    }

    .fd-select__trigger.is-open:not(:disabled) {
      border-color: var(--fd-primary-border, rgba(217, 119, 54, 0.42));
    }

    .fd-select__trigger:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .fd-select__value {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      flex: 1;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fd-select__placeholder {
      color: var(--fd-text-dim, #70665c);
    }

    .fd-select__chevron {
      display: inline-flex;
      align-items: center;
      color: var(--fd-text-muted, #9e9386);
      flex-shrink: 0;
      transition: transform var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease);
    }

    .fd-select__trigger.is-open .fd-select__chevron {
      transform: rotate(180deg);
      color: var(--fd-primary, #d97736);
    }

    .fd-select__menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      z-index: 50;
      min-width: 100%;
      max-height: 220px;
      overflow-y: auto;
      padding: 4px;
      border-radius: var(--fd-radius-md, 8px);
      background: var(--fd-bg-surface, #1a1613);
      border: 1px solid var(--fd-border-strong, rgba(196, 181, 165, 0.32));
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
    }

    .fd-select__option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
      padding: 7px 10px;
      border: none;
      border-radius: var(--fd-radius-sm, 6px);
      background: transparent;
      color: var(--fd-text-secondary, #d8cfc4);
      font-family: inherit;
      font-size: var(--fd-text-sm, 14px);
      text-align: left;
      cursor: pointer;
      transition:
        background-color var(--fd-duration-fast, 0.1s) var(--fd-ease-default, ease),
        color var(--fd-duration-fast, 0.1s) var(--fd-ease-default, ease);
    }

    .fd-select__option:hover:not(.is-disabled),
    .fd-select__option.is-active:not(.is-disabled) {
      background: var(--fd-bg-elevated, #28211d);
      color: var(--fd-text-primary, #f6f1ea);
    }

    .fd-select__option.is-selected {
      background: var(--fd-primary-subtle, rgba(217, 119, 54, 0.16));
      color: var(--fd-primary, #d97736);
      font-weight: 600;
    }

    .fd-select__option.is-disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .fd-select__option-main {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fd-select__empty {
      padding: 8px 10px;
      font-size: var(--fd-text-xs, 12px);
      color: var(--fd-text-dim, #70665c);
      text-align: center;
    }
  `;

  @property({ type: Array })
  options: FdSelectOption[] = [];

  @property({ type: String })
  value = '';

  @property({ type: String })
  placeholder = '선택하세요';

  @property({ type: String, reflect: true })
  size: FdSelectSize = 'md';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String })
  name = '';

  @state()
  private isOpen = false;

  @state()
  private activeIndex = -1;

  @query('.fd-select__trigger')
  private triggerEl?: HTMLButtonElement;

  private readonly handleDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.isOpen) return;
    if (!event.composedPath().includes(this)) {
      this.closeMenu();
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('pointerdown', this.handleDocumentPointerDown);
  }

  override disconnectedCallback(): void {
    document.removeEventListener('pointerdown', this.handleDocumentPointerDown);
    super.disconnectedCallback();
  }

  override focus(options?: FocusOptions): void {
    this.triggerEl?.focus(options);
  }

  private get selectedOption(): FdSelectOption | undefined {
    return this.options.find((opt) => opt.value === this.value);
  }

  private findNextEnabledIndex(startIndex: number, step: 1 | -1): number {
    if (this.options.length === 0) return -1;
    let idx = startIndex;
    for (let i = 0; i < this.options.length; i += 1) {
      idx = (idx + step + this.options.length) % this.options.length;
      if (!this.options[idx]?.disabled) {
        return idx;
      }
    }
    return -1;
  }

  private findEdgeEnabledIndex(fromEnd: boolean): number {
    if (this.options.length === 0) return -1;
    const indices = fromEnd
      ? Array.from({ length: this.options.length }, (_, i) => this.options.length - 1 - i)
      : Array.from({ length: this.options.length }, (_, i) => i);
    return indices.find((idx) => !this.options[idx]?.disabled) ?? -1;
  }

  private openMenu(focusFromEnd = false): void {
    if (this.disabled) return;
    this.isOpen = true;
    const selectedIdx = this.options.findIndex((opt) => opt.value === this.value && !opt.disabled);
    this.activeIndex = selectedIdx >= 0 ? selectedIdx : this.findEdgeEnabledIndex(focusFromEnd);
  }

  private closeMenu(restoreFocus = false): void {
    this.isOpen = false;
    this.activeIndex = -1;
    if (restoreFocus) {
      this.triggerEl?.focus();
    }
  }

  private toggleMenu(): void {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  private selectOption(option: FdSelectOption): void {
    if (option.disabled) return;
    const changed = this.value !== option.value;
    this.value = option.value;
    this.closeMenu(true);

    if (changed) {
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      this.dispatchEvent(
        new CustomEvent('fd-change', {
          detail: { value: this.value, option },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (!this.isOpen) {
          this.openMenu(false);
        } else {
          this.activeIndex = this.findNextEnabledIndex(this.activeIndex, 1);
        }
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.isOpen) {
          this.openMenu(true);
        } else {
          const base = this.activeIndex < 0 ? 0 : this.activeIndex;
          this.activeIndex = this.findNextEnabledIndex(base, -1);
        }
        break;
      }
      case 'Home': {
        if (this.isOpen) {
          event.preventDefault();
          this.activeIndex = this.findEdgeEnabledIndex(false);
        }
        break;
      }
      case 'End': {
        if (this.isOpen) {
          event.preventDefault();
          this.activeIndex = this.findEdgeEnabledIndex(true);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (!this.isOpen) {
          this.openMenu(false);
        } else if (this.activeIndex >= 0 && this.options[this.activeIndex]) {
          this.selectOption(this.options[this.activeIndex]);
        }
        break;
      }
      case 'Escape': {
        if (this.isOpen) {
          event.preventDefault();
          this.closeMenu(true);
        }
        break;
      }
      case 'Tab': {
        if (this.isOpen) {
          this.closeMenu(false);
        }
        break;
      }
    }
  }

  override render() {
    const selected = this.selectedOption;
    const iconSize = this.size === 'sm' ? 13 : 15;

    return html`
      <div class="fd-select" @keydown=${this.handleKeyDown}>
        <button
          type="button"
          class="fd-select__trigger fd-select__trigger--${this.size} ${this.isOpen ? 'is-open' : ''}"
          role="combobox"
          aria-expanded=${this.isOpen ? 'true' : 'false'}
          aria-haspopup="listbox"
          ?disabled=${this.disabled}
          @click=${this.toggleMenu}
        >
          <span class="fd-select__value ${selected ? '' : 'fd-select__placeholder'}">
            ${selected?.icon ? renderFdIcon(selected.icon, iconSize) : nothing}
            <span>${selected ? selected.label : this.placeholder}</span>
          </span>
          <span class="fd-select__chevron">${renderFdIcon('chevron-down', iconSize)}</span>
        </button>

        ${this.isOpen
          ? html`
              <div class="fd-select__menu" role="listbox">
                ${this.options.length === 0
                  ? html`<div class="fd-select__empty">옵션이 없습니다</div>`
                  : this.options.map((opt, idx) => {
                      const isSelected = opt.value === this.value;
                      const isActive = idx === this.activeIndex;
                      const classes = [
                        'fd-select__option',
                        isSelected ? 'is-selected' : '',
                        isActive ? 'is-active' : '',
                        opt.disabled ? 'is-disabled' : '',
                      ]
                        .filter(Boolean)
                        .join(' ');

                      return html`
                        <button
                          type="button"
                          role="option"
                          class=${classes}
                          aria-selected=${isSelected ? 'true' : 'false'}
                          aria-disabled=${opt.disabled ? 'true' : 'false'}
                          ?disabled=${Boolean(opt.disabled)}
                          @mouseenter=${() => {
                            if (!opt.disabled) this.activeIndex = idx;
                          }}
                          @click=${() => this.selectOption(opt)}
                        >
                          <span class="fd-select__option-main">
                            ${opt.icon ? renderFdIcon(opt.icon, 14) : nothing}
                            <span>${opt.label}</span>
                          </span>
                          ${isSelected ? renderFdIcon('check', 14) : nothing}
                        </button>
                      `;
                    })}
              </div>
            `
          : nothing}
      </div>
    `;
  }
}
