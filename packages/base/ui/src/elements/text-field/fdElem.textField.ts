import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { renderFdIcon, renderFdIconSlot } from '../common/fdElem.icon';

export type FdTextFieldSize = 'sm' | 'md';
export type FdTextFieldStatus = 'info' | 'pass' | 'fail';
export type FdTextFieldValidateOn = 'instant' | 'lazy';
export type FdTextFieldRule = (value: string) => boolean | string;

/**
 * Framework-agnostic text field Web Component (`<fd-text-field>`).
 * Supports `delegatesFocus`, clearable X button, left/right icons (attribute or named slot),
 * status helper messages (`info` / `pass` / `fail`), and `instant` / `lazy` rule validation.
 */
@customElement('fd-text-field')
export class FdTextFieldElement extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
      font-family: var(--fd-font-sans, inherit);
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    .fd-tf {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
      min-width: 0;
    }

    .fd-tf__control {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      min-width: 0;
      border-radius: var(--fd-radius-md, 8px);
      background: var(--fd-bg-elevated, #28211d);
      border: 1px solid var(--fd-border-subtle, rgba(196, 181, 165, 0.16));
      transition:
        border-color var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease),
        background-color var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease);
    }

    .fd-tf__control--sm {
      height: var(--fd-control-height-sm, 30px);
      padding: 0 8px;
      border-radius: var(--fd-radius-sm, 6px);
    }

    .fd-tf__control--md {
      height: var(--fd-control-height-md, 36px);
      padding: 0 10px;
    }

    .fd-tf__control:hover:not(.is-disabled) {
      border-color: var(--fd-border-strong, rgba(196, 181, 165, 0.32));
    }

    .fd-tf__control:focus-within:not(.is-disabled) {
      border-color: var(--fd-primary-border, rgba(217, 119, 54, 0.42));
    }

    .fd-tf__control.is-pass:not(.is-disabled) {
      border-color: var(--fd-secondary-border, rgba(92, 150, 116, 0.45));
    }

    .fd-tf__control.is-fail:not(.is-disabled) {
      border-color: var(--fd-danger-border, rgba(217, 78, 67, 0.45));
    }

    .fd-tf__control.is-disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    .fd-tf__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--fd-text-dim, #70665c);
      flex-shrink: 0;
      transition: color var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease);
    }

    .fd-tf__icon.is-hidden {
      display: none;
    }

    .fd-tf__control:focus-within:not(.is-disabled) .fd-tf__icon--left {
      color: var(--fd-primary, #d97736);
    }

    .fd-tf__input {
      flex: 1;
      width: 100%;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      color: var(--fd-text-primary, #f6f1ea);
      font-family: inherit;
      font-size: var(--fd-text-base, 16px);
      line-height: 1.4;
      padding: 0;
      margin: 0;
    }

    .fd-tf__control--sm .fd-tf__input {
      font-size: var(--fd-text-sm, 14px);
      line-height: 1.3;
    }

    .fd-tf__input::placeholder {
      color: var(--fd-text-dim, #70665c);
    }

    .fd-tf__input:disabled {
      cursor: not-allowed;
    }

    .fd-tf__clear {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      padding: 0;
      border: none;
      border-radius: var(--fd-radius-sm, 6px);
      background: transparent;
      color: var(--fd-text-muted, #9e9386);
      cursor: pointer;
      flex-shrink: 0;
      transition:
        color var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease),
        background-color var(--fd-duration-normal, 0.15s) var(--fd-ease-default, ease);
    }

    .fd-tf__clear:hover {
      color: var(--fd-text-primary, #f6f1ea);
      background: rgba(255, 255, 255, 0.08);
    }

    .fd-tf__message {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding-left: 2px;
      font-size: var(--fd-text-xs, 12px);
      line-height: 1.35;
      color: var(--fd-text-muted, #9e9386);
    }

    .fd-tf__message.is-pass {
      color: var(--fd-secondary-text, #a3cbb2);
    }

    .fd-tf__message.is-fail {
      color: var(--fd-danger-text, #fecaca);
    }
  `;

  @property({ type: String })
  value = '';

  @property({ type: String })
  placeholder = '';

  @property({ type: String })
  type = 'text';

  @property({ type: String })
  name = '';

  @property({ type: String, reflect: true })
  size: FdTextFieldSize = 'md';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  readonly = false;

  @property({ type: Boolean })
  clearable = true;

  @property({ type: String, attribute: 'clear-label' })
  clearLabel = '입력 지우기';

  @property({ type: String, attribute: 'left-icon' })
  leftIcon?: string;

  @property({ type: String, attribute: 'right-icon' })
  rightIcon?: string;

  @property({ type: String, reflect: true })
  status?: FdTextFieldStatus;

  @property({ type: String })
  message?: string;

  @property({ type: String, attribute: 'validate-on' })
  validateOn: FdTextFieldValidateOn = 'lazy';

  @property({ attribute: false })
  rules: FdTextFieldRule[] = [];

  @property({ type: String, attribute: 'pass-message' })
  passMessage?: string;

  @property({ type: String })
  autocomplete?: string;

  @property({ type: Number })
  maxlength?: number;

  @property({ type: String })
  inputmode?: string;

  @state()
  private ruleStatus?: FdTextFieldStatus;

  @state()
  private ruleMessage?: string;

  @state()
  private hasLeftSlot = false;

  @state()
  private hasRightSlot = false;

  @query('.fd-tf__input')
  private inputEl?: HTMLInputElement;

  override focus(options?: FocusOptions): void {
    this.inputEl?.focus(options);
  }

  /**
   * Runs all registered `rules` against the current `value`.
   * Returns `true` when all rules pass, or `false` on the first failing rule.
   */
  validate(): boolean {
    if (!this.rules || this.rules.length === 0) {
      this.ruleStatus = undefined;
      this.ruleMessage = undefined;
      return true;
    }

    for (const rule of this.rules) {
      const result = rule(this.value);
      if (result !== true) {
        this.ruleStatus = 'fail';
        this.ruleMessage = typeof result === 'string' ? result : '유효하지 않은 입력입니다.';
        return false;
      }
    }

    this.ruleStatus = 'pass';
    this.ruleMessage = this.passMessage;
    return true;
  }

  /**
   * Clears any internal validation status and message produced by `rules`.
   */
  resetValidation(): void {
    this.ruleStatus = undefined;
    this.ruleMessage = undefined;
  }

  private get effectiveStatus(): FdTextFieldStatus | undefined {
    return this.status ?? this.ruleStatus;
  }

  private get effectiveMessage(): string | undefined {
    return this.message ?? this.ruleMessage;
  }

  private handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;

    if (this.rules.length > 0 && (this.validateOn === 'instant' || this.ruleStatus === 'fail')) {
      this.validate();
    }

    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(
      new CustomEvent('fd-input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleChange(): void {
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    this.dispatchEvent(
      new CustomEvent('fd-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleBlur(): void {
    if (this.validateOn === 'lazy' && this.rules.length > 0) {
      this.validate();
    }
  }

  private handleClear(): void {
    if (this.disabled || this.readonly) return;
    this.value = '';
    if (this.inputEl) {
      this.inputEl.value = '';
      this.inputEl.focus();
    }

    if (this.rules.length > 0 && this.validateOn === 'instant') {
      this.validate();
    } else if (this.ruleStatus) {
      this.resetValidation();
    }

    this.dispatchEvent(
      new CustomEvent('fd-clear', {
        detail: { value: '' },
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(
      new CustomEvent('fd-input', {
        detail: { value: '' },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleSlotChange(side: 'left' | 'right', event: Event): void {
    const slot = event.target as HTMLSlotElement;
    const assigned = slot.assignedNodes({ flatten: true }).length > 0;
    if (side === 'left') {
      this.hasLeftSlot = assigned;
    } else {
      this.hasRightSlot = assigned;
    }
  }

  private renderStatusIcon(status?: FdTextFieldStatus) {
    if (status === 'pass') return renderFdIcon('circle-check', 13);
    if (status === 'fail') return renderFdIcon('circle-alert', 13);
    if (status === 'info') return renderFdIcon('info', 13);
    return nothing;
  }

  override render() {
    const iconSize = this.size === 'sm' ? 14 : 16;
    const showLeft = Boolean(this.leftIcon || this.hasLeftSlot);
    const showRight = Boolean(this.rightIcon || this.hasRightSlot);
    const showClear = this.clearable && !this.disabled && !this.readonly && this.value.length > 0;
    const activeStatus = this.effectiveStatus;
    const activeMessage = this.effectiveMessage;

    const controlClasses = [
      'fd-tf__control',
      `fd-tf__control--${this.size}`,
      this.disabled ? 'is-disabled' : '',
      activeStatus === 'pass' ? 'is-pass' : '',
      activeStatus === 'fail' ? 'is-fail' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="fd-tf">
        <div class=${controlClasses}>
          <span
            class="fd-tf__icon fd-tf__icon--left ${showLeft ? '' : 'is-hidden'}"
            @slotchange=${(e: Event) => this.handleSlotChange('left', e)}
          >
            ${renderFdIconSlot('left-icon', this.leftIcon, iconSize)}
          </span>

          <input
            class="fd-tf__input"
            .value=${this.value}
            type=${this.type}
            name=${ifDefined(this.name || undefined)}
            placeholder=${ifDefined(this.placeholder || undefined)}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            autocomplete=${ifDefined(this.autocomplete)}
            maxlength=${ifDefined(this.maxlength)}
            inputmode=${ifDefined(this.inputmode)}
            aria-invalid=${activeStatus === 'fail' ? 'true' : 'false'}
            @input=${this.handleInput}
            @change=${this.handleChange}
            @blur=${this.handleBlur}
          />

          ${showClear
            ? html`
                <button
                  type="button"
                  class="fd-tf__clear"
                  tabindex="-1"
                  aria-label=${this.clearLabel}
                  title=${this.clearLabel}
                  @click=${this.handleClear}
                >
                  ${renderFdIcon('x', 13)}
                </button>
              `
            : nothing}

          <span
            class="fd-tf__icon fd-tf__icon--right ${showRight ? '' : 'is-hidden'}"
            @slotchange=${(e: Event) => this.handleSlotChange('right', e)}
          >
            ${renderFdIconSlot('right-icon', this.rightIcon, iconSize)}
          </span>
        </div>

        ${activeMessage
          ? html`
              <div
                class="fd-tf__message ${activeStatus ? `is-${activeStatus}` : ''}"
                role=${activeStatus === 'fail' ? 'alert' : 'status'}
              >
                ${this.renderStatusIcon(activeStatus)}
                <span>${activeMessage}</span>
              </div>
            `
          : nothing}
      </div>
    `;
  }
}
