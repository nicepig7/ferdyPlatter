import { Show, createSignal } from 'solid-js';
import type { FdTabItem } from '@ferdy/ui/elements';
import type { ControlSize, EventLogEntry, PushLogFn, ShowcaseLayer } from './smpCompo.type';
import { EventInspector } from './components/smpCompo.eventInspector';
import { StyleLayerPanel } from './components/smpCompo.styleLayer';
import { TextFieldPlayground } from './components/smpCompo.textField';
import { WidgetsPlayground } from './components/smpCompo.widgets';
import './smpCompo.app.css';

const LAYER_TABS: FdTabItem[] = [
  { value: 'layer1', label: '1층 Style Layer (.fd-*)', icon: 'palette' },
  { value: 'layer2', label: '2층 Web Components (<fd-*>)', icon: 'blocks' },
];

const SIZE_TABS: FdTabItem[] = [
  { value: 'sm', label: 'sm' },
  { value: 'md', label: 'md' },
];

export function AppComponents() {
  const [activeLayer, setActiveLayer] = createSignal<ShowcaseLayer>('layer2');
  const [controlSize, setControlSize] = createSignal<ControlSize>('md');
  const [allDisabled, setAllDisabled] = createSignal(false);
  const [logs, setLogs] = createSignal<EventLogEntry[]>([]);
  let nextLogId = 1;

  const pushLog: PushLogFn = (source, event, detail) => {
    const time = new Date().toTimeString().slice(0, 8);
    const entry: EventLogEntry = {
      id: nextLogId++,
      time,
      source,
      event,
      detail: JSON.stringify(detail),
    };
    setLogs((prev) => [entry, ...prev].slice(0, 40));
  };

  return (
    <div class="smpCompo-shell">
      <header class="smpCompo-header">
        <div class="smpCompo-header__title-group">
          <div class="smpCompo-header__title-row">
            <h1 class="smpCompo-header__title">Ferdy UI Showcase</h1>
            <span class="fd-badge fd-badge--primary">@ferdy/ui v0.1.9</span>
            <span class="fd-badge fd-badge--secondary">2-Layer Hybrid</span>
          </div>
          <p class="smpCompo-header__subtitle">
            1층 Style Layer(<code class="smpCompo-code">.fd-*</code>) &amp; 2층 Lit Web Components(
            <code class="smpCompo-code">&lt;fd-*&gt;</code>) 인터랙티브 플레이그라운드
          </p>
        </div>

        <fd-tabs
          prop:items={LAYER_TABS}
          prop:value={activeLayer()}
          variant="segmented"
          size="md"
          on:fd-change={(e) => {
            setActiveLayer(e.detail.value as ShowcaseLayer);
            pushLog('header-tabs', 'fd-change', e.detail);
          }}
        />
      </header>

      <div
        class="smpCompo-body"
        classList={{ 'smpCompo-body--with-inspector': activeLayer() === 'layer2' }}
      >
        <main class="smpCompo-main">
          <Show when={activeLayer() === 'layer1'}>
            <StyleLayerPanel />
          </Show>

          <Show when={activeLayer() === 'layer2'}>
            <div class="smpCompo-toolbar">
              <div class="smpCompo-toolbar__group">
                <span class="smpCompo-toolbar__label">Global Controls</span>
                <fd-tabs
                  prop:items={SIZE_TABS}
                  prop:value={controlSize()}
                  variant="segmented"
                  size="sm"
                  on:fd-change={(e) => {
                    setControlSize(e.detail.value as ControlSize);
                    pushLog('global-size', 'fd-change', e.detail);
                  }}
                />
                <fd-switch
                  prop:checked={allDisabled()}
                  size="sm"
                  label="Disabled All"
                  on:fd-change={(e) => {
                    setAllDisabled(e.detail.checked);
                    pushLog('global-disabled', 'fd-change', e.detail);
                  }}
                />
              </div>
              <span class="fd-badge fd-badge--secondary">
                size: {controlSize()} | disabled: {allDisabled() ? 'true' : 'false'}
              </span>
            </div>

            <TextFieldPlayground size={controlSize()} disabled={allDisabled()} onLog={pushLog} />
            <WidgetsPlayground size={controlSize()} disabled={allDisabled()} onLog={pushLog} />
          </Show>
        </main>

        <Show when={activeLayer() === 'layer2'}>
          <EventInspector logs={logs()} onClear={() => setLogs([])} />
        </Show>
      </div>
    </div>
  );
}
