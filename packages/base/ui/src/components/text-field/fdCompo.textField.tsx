import { Component, Show, createSignal, mergeProps, splitProps } from 'solid-js';
import { Icon } from '../icon/fdCompo.icon';
import { Input, type InputProps } from '../input/fdCompo.input';
import './fdCompo.textField.css';

export interface TextFieldProps extends Omit<InputProps, 'variant'> {
  /** 좌측에 표시할 선택적 Lucide 아이콘 이름 */
  leftIcon?: string;
  /** 지우기(X) 버튼 표시 여부 (기본값: true) */
  clearable?: boolean;
  /** 지우기(X) 버튼 접근성 라벨 및 툴팁 */
  clearLabel?: string;
  /** 지우기(X) 버튼 클릭 시 콜백 (미지정 시 input 이벤트를 발생시켜 값을 비웁니다) */
  onClear?: () => void;
  /** 루트 컨테이너(.fd-text-field)에 추가할 클래스 */
  containerClass?: string;
}

export type FdTextFieldProps = TextFieldProps;

/**
 * SolidJS-native TextField wrapper (`fd.TextField`) for Core and Solid apps.
 * For cross-framework (React / Vue / Solid) usage with validation rules and status messages,
 * prefer `<fd-text-field>` from `@ferdy/ui/elements`.
 */
export const TextField: Component<TextFieldProps> = (rawProps) => {
  const merged = mergeProps(
    {
      size: 'md' as const,
      clearable: true,
      clearLabel: '입력 지우기',
    },
    rawProps
  );

  const [local, rest] = splitProps(merged, [
    'leftIcon',
    'clearable',
    'clearLabel',
    'onClear',
    'containerClass',
    'size',
    'class',
    'value',
    'ref',
    'onInput',
    'disabled',
  ]);

  let inputRef: HTMLInputElement | undefined;
  const [internalHasValue, setInternalHasValue] = createSignal(false);

  const hasValue = () =>
    local.value !== undefined ? String(local.value).length > 0 : internalHasValue();

  const showClearButton = () => local.clearable && !local.disabled && hasValue();

  const bindRef = (el: HTMLInputElement) => {
    inputRef = el;
    setInternalHasValue(el.value.length > 0);
    if (typeof local.ref === 'function') {
      local.ref(el);
    }
  };

  const handleInput: InputProps['onInput'] = (e) => {
    setInternalHasValue(e.currentTarget.value.length > 0);
    if (typeof local.onInput === 'function') {
      local.onInput(e);
    }
  };

  const handleClear = () => {
    setInternalHasValue(false);
    if (inputRef) {
      inputRef.value = '';
      inputRef.focus();
    }
    if (local.onClear) {
      local.onClear();
    } else if (inputRef) {
      inputRef.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div
      class={`fd-text-field fd-text-field--${local.size}${local.containerClass ? ` ${local.containerClass}` : ''}`}
      classList={{ 'is-disabled': Boolean(local.disabled) }}
    >
      <Show when={local.leftIcon}>
        {(iconName) => (
          <Icon
            name={iconName()}
            size={local.size === 'sm' ? 'xs' : 'sm'}
            class="fd-text-field__icon"
          />
        )}
      </Show>

      <Input
        ref={bindRef}
        variant="ghost"
        size={local.size}
        value={local.value}
        disabled={local.disabled}
        class={`fd-text-field__input${local.class ? ` ${local.class}` : ''}`}
        onInput={handleInput}
        {...rest}
      />

      <Show when={showClearButton()}>
        <button
          type="button"
          class="fd-compo fd-text-field__clear"
          aria-label={local.clearLabel}
          title={local.clearLabel}
          onClick={handleClear}
        >
          <Icon name="x" size="xs" />
        </button>
      </Show>
    </div>
  );
};

export const FdTextField = TextField;
