import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

export type FdSwitchSize = 'sm' | 'md';

/**
 * Framework-agnostic toggle switch Web Component (`<fd-switch>`).
 * Exposes `role="switch"`, `Space` / `Enter` keyboard toggling, and `fd-change` custom events.
 */
@customElement('fd-switch')
export class FdSwitchElement extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      font-family: var(--fd-font-sans, inherit);
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    .fd-switch {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--fd-text-primary, #f6f1ea);
      font-family: inherit;
      cursor: pointer;
      user-select: none;
    }

    .fd-switch:focus-visible {
      outline: 2px solid var(--fd-primary-focus, rgba(217, 119, 54, 0.68));
      outline-offset: 3px;
      border-radius: var(--fd-radius-pill, 999px);
    }

    .fd-switch:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .fd-switch__track {
      position: relative;
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      border-radius: var(--fd-radius-pill, 999px);
      background: var(--fd-bg-elevated, #28211d);
      border: 1px solid var(--fd-border-strong, rgba(196, 181, 165, 0.32));
      transition:
        background-color var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease),
        border-color var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease);
    }

    .fd-switch--sm .fd-switch__track {
      width: 32px;
      height: 18px;
      padding: 2px;
    }

    .fd-switch--md .fd-switch__track {
      width: 40px;
      height: 22px;
      padding: 2px;
    }

    .fd-switch__thumb {
      display: block;
      border-radius: 50%;
      background: var(--fd-text-secondary, #d8cfc4);
      transition:
        transform var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease),
        background-color var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease);
    }

    .fd-switch--sm .fd-switch__thumb {
      width: 12px;
      height: 12px;
    }

    .fd-switch--md .fd-switch__thumb {
      width: 16px;
      height: 16px;
    }

    .fd-switch.is-checked .fd-switch__track {
      background: var(--fd-primary-strong, #b45318);
      border-color: var(--fd-primary, #d97736);
    }

    .fd-switch.is-checked .fd-switch__thumb {
      background: var(--fd-text-on-primary, #fffaf5);
    }

    .fd-switch--sm.is-checked .fd-switch__thumb {
      transform: translateX(14px);
    }

    .fd-switch--md.is-checked .fd-switch__thumb {
      transform: translateX(18px);
    }

    .fd-switch__label {
      font-size: var(--fd-text-sm, 14px);
      line-height: 1.3;
      color: var(--fd-text-secondary, #d8cfc4);
    }

    .fd-switch--sm .fd-switch__label {
      font-size: var(--fd-text-xs, 12px);
    }
  `;

  @property({ type: Boolean, reflect: true })
  checked = false;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String, reflect: true })
  size: FdSwitchSize = 'md';

  @property({ type: String })
  label = '';

  @property({ type: String })
  name = '';

  @query('.fd-switch')
  private buttonEl?: HTMLButtonElement;

  override focus(options?: FocusOptions): void {
    this.buttonEl?.focus(options);
  }

  private toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    this.dispatchEvent(
      new CustomEvent('fd-change', {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    const classes = [
      'fd-switch',
      `fd-switch--${this.size}`,
      this.checked ? 'is-checked' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <button
        type="button"
        role="switch"
        class=${classes}
        aria-checked=${this.checked ? 'true' : 'false'}
        ?disabled=${this.disabled}
        @click=${this.toggle}
      >
        <span class="fd-switch__track">
          <span class="fd-switch__thumb"></span>
        </span>
        ${this.label
          ? html`<span class="fd-switch__label">${this.label}</span>`
          : html`<slot class="fd-switch__label"></slot>`}
      </button>
    `;
  }
}
