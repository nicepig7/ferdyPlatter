import { For, createSignal } from 'solid-js';
import type { FdSelectOption, FdTabItem, FdTabsVariant } from '@ferdy/ui/elements';
import type { ControlSize, PushLogFn } from '../smpCompo.type';

interface WidgetsPlaygroundProps {
  size: ControlSize;
  disabled: boolean;
  onLog: PushLogFn;
}

const SELECT_PRESETS: Record<'category' | 'priority', FdSelectOption[]> = {
  category: [
    { value: 'work', label: 'Work', icon: 'kanban' },
    { value: 'personal', label: 'Personal', icon: 'sparkles' },
    { value: 'schedule', label: 'Schedule', icon: 'calendar' },
    { value: 'archive', label: 'Archived (Disabled)', icon: 'archive', disabled: true },
  ],
  priority: [
    { value: 'high', label: 'High Priority', icon: 'flame' },
    { value: 'medium', label: 'Medium Priority', icon: 'minus' },
    { value: 'low', label: 'Low Priority', icon: 'arrow-down' },
  ],
};

const PRESET_OPTIONS: FdSelectOption[] = [
  { value: 'category', label: 'Category Preset', icon: 'folder' },
  { value: 'priority', label: 'Priority Preset', icon: 'flag' },
];

const DEMO_TABS: FdTabItem[] = [
  { value: 'all', label: 'All', count: 12, icon: 'layers' },
  { value: 'todo', label: 'Todo', count: 5, icon: 'circle' },
  { value: 'doing', label: 'In Progress', count: 4, icon: 'clock' },
  { value: 'done', label: 'Done', count: 3, icon: 'check' },
];

const TAB_VARIANTS: FdTabsVariant[] = ['pill', 'underline', 'segmented'];

export function WidgetsPlayground(props: WidgetsPlaygroundProps) {
  const [presetKey, setPresetKey] = createSignal<'category' | 'priority'>('category');
  const [selectValue, setSelectValue] = createSignal('work');
  const [switchChecked, setSwitchChecked] = createSignal(true);
  const [switchCompactChecked, setSwitchCompactChecked] = createSignal(false);
  const [demoTabValue, setDemoTabValue] = createSignal('all');

  const handlePresetChange = (nextPreset: 'category' | 'priority') => {
    setPresetKey(nextPreset);
    const firstEnabled = SELECT_PRESETS[nextPreset].find((opt) => !opt.disabled);
    if (firstEnabled) {
      setSelectValue(firstEnabled.value);
    }
  };

  return (
    <>
      <div class="smpCompo-grid-2">
        <section class="fd-card smpCompo-section">
          <div class="smpCompo-section__header">
            <h2 class="smpCompo-section__title">&lt;fd-select&gt;</h2>
            <span class="fd-badge fd-badge--secondary">Keyboard Nav</span>
          </div>
          <div class="smpCompo-group">
            <span class="smpCompo-group__label">옵션 프리셋 전환</span>
            <fd-select
              prop:options={PRESET_OPTIONS}
              prop:value={presetKey()}
              prop:size={props.size}
              prop:disabled={props.disabled}
              on:fd-change={(e) => {
                handlePresetChange(e.detail.value as 'category' | 'priority');
                props.onLog('fd-select[preset]', 'fd-change', e.detail);
              }}
            />
          </div>
          <div class="smpCompo-group">
            <span class="smpCompo-group__label">선택된 값: {selectValue()}</span>
            <fd-select
              prop:options={SELECT_PRESETS[presetKey()]}
              prop:value={selectValue()}
              prop:size={props.size}
              prop:disabled={props.disabled}
              placeholder="항목을 선택하세요"
              on:fd-change={(e) => {
                setSelectValue(e.detail.value);
                props.onLog('fd-select[main]', 'fd-change', e.detail);
              }}
            />
          </div>
        </section>

        <section class="fd-card smpCompo-section">
          <div class="smpCompo-section__header">
            <h2 class="smpCompo-section__title">&lt;fd-switch&gt;</h2>
            <span class="fd-badge fd-badge--secondary">role="switch"</span>
          </div>
          <div class="smpCompo-stack">
            <fd-switch
              prop:checked={switchChecked()}
              prop:size={props.size}
              prop:disabled={props.disabled}
              label={`알림 활성화 (${switchChecked() ? 'ON' : 'OFF'})`}
              on:fd-change={(e) => {
                setSwitchChecked(e.detail.checked);
                props.onLog('fd-switch[notify]', 'fd-change', e.detail);
              }}
            />
            <fd-switch
              prop:checked={switchCompactChecked()}
              prop:size={props.size}
              prop:disabled={props.disabled}
              label={`컴팩트 모드 (${switchCompactChecked() ? 'ON' : 'OFF'})`}
              on:fd-change={(e) => {
                setSwitchCompactChecked(e.detail.checked);
                props.onLog('fd-switch[compact]', 'fd-change', e.detail);
              }}
            />
          </div>
        </section>
      </div>

      <section class="fd-card smpCompo-section">
        <div class="smpCompo-section__header">
          <h2 class="smpCompo-section__title">&lt;fd-tabs&gt;</h2>
          <span class="fd-badge fd-badge--neutral">pill · underline · segmented</span>
        </div>
        <div class="smpCompo-stack">
          <For each={TAB_VARIANTS}>
            {(variant) => (
              <div class="smpCompo-group">
                <span class="smpCompo-group__label">
                  variant="{variant}" (active: {demoTabValue()})
                </span>
                <fd-tabs
                  prop:items={DEMO_TABS}
                  prop:value={demoTabValue()}
                  prop:size={props.size}
                  prop:disabled={props.disabled}
                  variant={variant}
                  on:fd-change={(e) => {
                    setDemoTabValue(e.detail.value);
                    props.onLog(`fd-tabs[${variant}]`, 'fd-change', e.detail);
                  }}
                />
              </div>
            )}
          </For>
        </div>
      </section>
    </>
  );
}
