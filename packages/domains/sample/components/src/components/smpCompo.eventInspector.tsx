import { For, Show } from 'solid-js';
import type { EventLogEntry } from '../smpCompo.type';

interface EventInspectorProps {
  logs: EventLogEntry[];
  onClear: () => void;
}

export function EventInspector(props: EventInspectorProps) {
  return (
    <aside class="smpCompo-inspector" aria-label="Custom Event Log Inspector">
      <div class="smpCompo-inspector__header">
        <span class="smpCompo-inspector__title">
          <span class="icon-terminal" aria-hidden="true" />
          Event Inspector ({props.logs.length})
        </span>
        <button
          type="button"
          class="fd-btn fd-btn--sm fd-btn--neutral"
          onClick={() => props.onClear()}
        >
          Clear
        </button>
      </div>
      <div class="smpCompo-inspector__list">
        <Show
          when={props.logs.length > 0}
          fallback={
            <div class="smpCompo-inspector__empty">
              위젯을 조작하면 <code class="smpCompo-code">fd-input</code>,{' '}
              <code class="smpCompo-code">fd-change</code>, <code class="smpCompo-code">fd-clear</code>{' '}
              커스텀 이벤트가 실시간으로 기록됩니다.
            </div>
          }
        >
          <For each={props.logs}>
            {(entry) => (
              <div class="smpCompo-log-item">
                <div class="smpCompo-log-item__top">
                  <span class="smpCompo-log-item__event">{entry.event}</span>
                  <span class="smpCompo-log-item__time">{entry.time}</span>
                </div>
                <span class="smpCompo-log-item__source">{entry.source}</span>
                <pre class="smpCompo-log-item__detail">{entry.detail}</pre>
              </div>
            )}
          </For>
        </Show>
      </div>
    </aside>
  );
}
