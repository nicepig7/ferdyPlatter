import { createSignal } from 'solid-js';
import type { FdTextFieldElement, FdTextFieldRule } from '@ferdy/ui/elements';
import type { ControlSize, PushLogFn } from '../smpCompo.type';

interface TextFieldPlaygroundProps {
  size: ControlSize;
  disabled: boolean;
  onLog: PushLogFn;
}

const INSTANT_RULES: FdTextFieldRule[] = [
  (v) => v.trim().length > 0 || '필수 입력 항목입니다.',
  (v) => v.trim().length >= 3 || '최소 3자 이상 입력하세요.',
  (v) => !/\s/.test(v) || '공백을 포함할 수 없습니다.',
];

const LAZY_RULES: FdTextFieldRule[] = [
  (v) => v.trim().length > 0 || 'Blur 또는 validate() 시 검증됩니다. 값을 입력하세요.',
  (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || '올바른 이메일 형식이 아닙니다.',
];

export function TextFieldPlayground(props: TextFieldPlaygroundProps) {
  const [searchValue, setSearchValue] = createSignal('');
  const [instantValue, setInstantValue] = createSignal('');
  const [lazyValue, setLazyValue] = createSignal('');
  let lazyFieldRef: FdTextFieldElement | undefined;

  return (
    <section class="fd-card smpCompo-section">
      <div class="smpCompo-section__header">
        <h2 class="smpCompo-section__title">&lt;fd-text-field&gt;</h2>
        <span class="fd-badge fd-badge--primary">delegatesFocus · Rules</span>
      </div>

      <div class="smpCompo-grid-2">
        <div class="smpCompo-group">
          <span class="smpCompo-group__label">Clearable + Left/Right Icons</span>
          <fd-text-field
            prop:value={searchValue()}
            prop:size={props.size}
            prop:disabled={props.disabled}
            clearable
            left-icon="search"
            right-icon="sparkles"
            placeholder="검색어를 입력하세요 (X 버튼으로 초기화)"
            on:fd-input={(e) => {
              setSearchValue(e.detail.value);
              props.onLog('fd-text-field[search]', 'fd-input', e.detail);
            }}
            on:fd-change={(e) => props.onLog('fd-text-field[search]', 'fd-change', e.detail)}
            on:fd-clear={(e) => {
              setSearchValue('');
              props.onLog('fd-text-field[search]', 'fd-clear', e.detail);
            }}
          />
        </div>

        <div class="smpCompo-group">
          <span class="smpCompo-group__label">Status Helper Messages (info / pass / fail)</span>
          <div class="smpCompo-stack">
            <fd-text-field
              prop:size={props.size}
              prop:disabled={props.disabled}
              status="info"
              message="info: 안내 메시지가 표시됩니다."
              value="Info state"
            />
            <fd-text-field
              prop:size={props.size}
              prop:disabled={props.disabled}
              status="pass"
              message="pass: 사용 가능한 값입니다."
              value="Pass state"
            />
            <fd-text-field
              prop:size={props.size}
              prop:disabled={props.disabled}
              status="fail"
              message="fail: 형식에 맞지 않는 값입니다."
              value="Fail state"
            />
          </div>
        </div>
      </div>

      <div class="smpCompo-grid-2">
        <div class="smpCompo-group">
          <span class="smpCompo-group__label">Rule Validation — validate-on="instant"</span>
          <fd-text-field
            prop:value={instantValue()}
            prop:size={props.size}
            prop:disabled={props.disabled}
            prop:rules={INSTANT_RULES}
            validate-on="instant"
            pass-message="유효한 ID입니다."
            clearable
            left-icon="user"
            placeholder="공백 없이 3자 이상 입력"
            on:fd-input={(e) => {
              setInstantValue(e.detail.value);
              props.onLog('fd-text-field[instant]', 'fd-input', e.detail);
            }}
            on:fd-clear={(e) => {
              setInstantValue('');
              props.onLog('fd-text-field[instant]', 'fd-clear', e.detail);
            }}
          />
        </div>

        <div class="smpCompo-group">
          <span class="smpCompo-group__label">Rule Validation — validate-on="lazy" + Manual API</span>
          <fd-text-field
            ref={(el) => {
              lazyFieldRef = el;
            }}
            prop:value={lazyValue()}
            prop:size={props.size}
            prop:disabled={props.disabled}
            prop:rules={LAZY_RULES}
            validate-on="lazy"
            pass-message="올바른 이메일 형식입니다."
            clearable
            left-icon="mail"
            placeholder="이메일 입력 후 포커스 이동 또는 validate()"
            on:fd-input={(e) => {
              setLazyValue(e.detail.value);
              props.onLog('fd-text-field[lazy]', 'fd-input', e.detail);
            }}
            on:fd-clear={(e) => {
              setLazyValue('');
              props.onLog('fd-text-field[lazy]', 'fd-clear', e.detail);
            }}
          />
          <div class="smpCompo-row">
            <button
              type="button"
              class="fd-btn fd-btn--sm fd-btn--primary"
              disabled={props.disabled}
              onClick={() => {
                const ok = lazyFieldRef?.validate();
                props.onLog('fd-text-field[lazy]', 'validate()', { valid: ok });
              }}
            >
              validate()
            </button>
            <button
              type="button"
              class="fd-btn fd-btn--sm fd-btn--neutral"
              disabled={props.disabled}
              onClick={() => {
                lazyFieldRef?.resetValidation();
                props.onLog('fd-text-field[lazy]', 'resetValidation()', {});
              }}
            >
              resetValidation()
            </button>
          </div>
        </div>
      </div>

      <div class="smpCompo-group">
        <span class="smpCompo-group__label">
          Multi-Field Tab Focus Traversal Test (X 버튼은 tabindex="-1"로 Tab 이동을 방해하지 않음)
        </span>
        <div class="smpCompo-grid-3">
          <fd-text-field
            prop:size={props.size}
            prop:disabled={props.disabled}
            clearable
            value="First"
            placeholder="Field 1"
          />
          <fd-text-field
            prop:size={props.size}
            prop:disabled={props.disabled}
            clearable
            value="Second"
            placeholder="Field 2"
          />
          <fd-text-field
            prop:size={props.size}
            prop:disabled={props.disabled}
            clearable
            value="Third"
            placeholder="Field 3"
          />
        </div>
      </div>
    </section>
  );
}
