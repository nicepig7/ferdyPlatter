import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/**
 * Phase 1 PoC Web Component.
 * Verifies Lit decorator reactivity (`@customElement`, `@property`, `@state`)
 * across SolidJS, React 19, and Vue 3 without Class Field Shadowing.
 */
@customElement('fd-poc-badge')
export class FdPocBadgeElement extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--fd-radius-full, 9999px);
      border: 1px solid var(--fd-border-default, rgba(255, 255, 255, 0.14));
      background: var(--fd-bg-elevated, rgba(255, 255, 255, 0.06));
      color: var(--fd-text-primary, #f4f4f5);
      font-family: var(--fd-font-sans, inherit);
      font-size: 12px;
      line-height: 1;
      cursor: pointer;
      user-select: none;
    }
  `;

  @property({ type: String })
  label = 'Lit PoC';

  @state()
  private count = 0;

  private handleClick(): void {
    this.count += 1;
    this.dispatchEvent(
      new CustomEvent('fd-poc-click', {
        detail: { count: this.count },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return html`
      <span @click=${this.handleClick}>
        ${this.label}${this.count > 0 ? ` (${this.count})` : ''}
      </span>
    `;
  }
}
