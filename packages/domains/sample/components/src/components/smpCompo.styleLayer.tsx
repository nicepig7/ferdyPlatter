import { For } from 'solid-js';

const BUTTON_VARIANTS = [
  'primary',
  'secondary',
  'neutral',
  'accent-ghost',
  'secondary-ghost',
  'danger',
] as const;

const BADGE_VARIANTS = ['primary', 'secondary', 'neutral'] as const;

export function StyleLayerPanel() {
  return (
    <>
      <section class="fd-card smpCompo-section">
        <div class="smpCompo-section__header">
          <h2 class="smpCompo-section__title">Button (.fd-btn)</h2>
          <span class="fd-badge fd-badge--neutral">@ferdy/ui/styles.css</span>
        </div>
        <p class="smpCompo-section__desc">
          네이티브 <code class="smpCompo-code">&lt;button&gt;</code>에{' '}
          <code class="smpCompo-code">.fd-btn</code>과 variant/size 클래스를 조합해 사용합니다.
        </p>

        <div class="smpCompo-group">
          <span class="smpCompo-group__label">Variants (Medium: .fd-btn--md)</span>
          <div class="smpCompo-row">
            <For each={BUTTON_VARIANTS}>
              {(variant) => (
                <button type="button" class={`fd-btn fd-btn--md fd-btn--${variant}`}>
                  {variant}
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="smpCompo-group">
          <span class="smpCompo-group__label">Sizes &amp; Disabled (.fd-btn--sm / :disabled)</span>
          <div class="smpCompo-row">
            <button type="button" class="fd-btn fd-btn--sm fd-btn--primary">
              Small Primary
            </button>
            <button type="button" class="fd-btn fd-btn--sm fd-btn--neutral">
              Small Neutral
            </button>
            <button type="button" class="fd-btn fd-btn--md fd-btn--primary" disabled>
              Disabled Primary
            </button>
            <button type="button" class="fd-btn fd-btn--md fd-btn--danger" disabled>
              Disabled Danger
            </button>
          </div>
        </div>
      </section>

      <div class="smpCompo-grid-2">
        <section class="fd-card smpCompo-section">
          <div class="smpCompo-section__header">
            <h2 class="smpCompo-section__title">Badge (.fd-badge)</h2>
            <span class="fd-badge fd-badge--neutral">CSS Class</span>
          </div>
          <div class="smpCompo-row">
            <For each={BADGE_VARIANTS}>
              {(variant) => (
                <span class={`fd-badge fd-badge--${variant}`}>
                  <span class="icon-tag" aria-hidden="true" />
                  badge--{variant}
                </span>
              )}
            </For>
          </div>
        </section>

        <section class="fd-card smpCompo-section">
          <div class="smpCompo-section__header">
            <h2 class="smpCompo-section__title">Card (.fd-card)</h2>
            <span class="fd-badge fd-badge--primary">Container</span>
          </div>
          <div class="smpCompo-card-sample">
            <h3 class="smpCompo-card-sample__title">표준 카드 컨테이너</h3>
            <p class="smpCompo-card-sample__text">
              <code class="smpCompo-code">--fd-bg-card</code>,{' '}
              <code class="smpCompo-code">--fd-border-subtle</code>,{' '}
              <code class="smpCompo-code">--fd-radius-lg</code> 토큰을 사용하는 1층 컨테이너입니다.
            </p>
          </div>
        </section>
      </div>

      <section class="fd-card smpCompo-section">
        <div class="smpCompo-section__header">
          <h2 class="smpCompo-section__title">Native Input (.fd-input)</h2>
          <span class="fd-badge fd-badge--neutral">Form Native</span>
        </div>
        <div class="smpCompo-grid-2">
          <div class="smpCompo-group">
            <span class="smpCompo-group__label">Default (.fd-input--default .fd-input--md)</span>
            <input
              type="text"
              class="fd-input fd-input--default fd-input--md"
              placeholder="기본 스타일 네이티브 인풋"
            />
          </div>
          <div class="smpCompo-group">
            <span class="smpCompo-group__label">Small (.fd-input--default .fd-input--sm)</span>
            <input
              type="text"
              class="fd-input fd-input--default fd-input--sm"
              placeholder="작은 사이즈 인풋"
            />
          </div>
          <div class="smpCompo-group">
            <span class="smpCompo-group__label">Ghost (.fd-input--ghost .fd-input--md)</span>
            <input
              type="text"
              class="fd-input fd-input--ghost fd-input--md"
              placeholder="보더 없는 Ghost 인풋"
            />
          </div>
          <div class="smpCompo-group">
            <span class="smpCompo-group__label">Disabled (:disabled)</span>
            <input
              type="text"
              class="fd-input fd-input--default fd-input--md"
              value="비활성화된 입력값"
              disabled
            />
          </div>
        </div>
      </section>
    </>
  );
}
