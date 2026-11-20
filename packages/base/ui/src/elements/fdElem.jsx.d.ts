import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import type { JSX as SolidJSX } from 'solid-js';
import type { DefineComponent } from 'vue';
import type { FdSelectElement, FdSelectOption, FdSelectSize } from './select/fdElem.select';
import type { FdSwitchElement, FdSwitchSize } from './switch/fdElem.switch';
import type { FdTabItem, FdTabsElement, FdTabsSize, FdTabsVariant } from './tabs/fdElem.tabs';
import type {
  FdTextFieldElement,
  FdTextFieldRule,
  FdTextFieldSize,
  FdTextFieldStatus,
  FdTextFieldValidateOn,
} from './text-field/fdElem.textField';

export interface FdTextFieldAttributes {
  value?: string;
  placeholder?: string;
  type?: string;
  name?: string;
  size?: FdTextFieldSize;
  disabled?: boolean;
  readonly?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  'clear-label'?: string;
  leftIcon?: string;
  'left-icon'?: string;
  rightIcon?: string;
  'right-icon'?: string;
  status?: FdTextFieldStatus;
  message?: string;
  validateOn?: FdTextFieldValidateOn;
  'validate-on'?: FdTextFieldValidateOn;
  rules?: FdTextFieldRule[];
  passMessage?: string;
  'pass-message'?: string;
  autocomplete?: string;
  maxlength?: number;
  inputmode?: string;
}

export interface FdSelectAttributes {
  options?: FdSelectOption[];
  value?: string;
  placeholder?: string;
  size?: FdSelectSize;
  disabled?: boolean;
  name?: string;
}

export interface FdSwitchAttributes {
  checked?: boolean;
  disabled?: boolean;
  size?: FdSwitchSize;
  label?: string;
  name?: string;
}

export interface FdTabsAttributes {
  items?: FdTabItem[];
  value?: string;
  variant?: FdTabsVariant;
  size?: FdTabsSize;
  disabled?: boolean;
}

type ReactCustomElement<El extends HTMLElement, Props> = DetailedHTMLProps<
  HTMLAttributes<El>,
  El
> &
  Props;

type SolidCustomElement<El extends HTMLElement, Props> = SolidJSX.HTMLAttributes<El> &
  Props & {
    [K in keyof Props as `prop:${string & K}`]?: Props[K];
  };

declare global {
  interface HTMLElementTagNameMap {
    'fd-text-field': FdTextFieldElement;
    'fd-select': FdSelectElement;
    'fd-switch': FdSwitchElement;
    'fd-tabs': FdTabsElement;
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'fd-text-field': ReactCustomElement<
        FdTextFieldElement,
        FdTextFieldAttributes & {
          'onfd-input'?: (event: CustomEvent<{ value: string }>) => void;
          'onfd-change'?: (event: CustomEvent<{ value: string }>) => void;
          'onfd-clear'?: (event: CustomEvent<{ value: string }>) => void;
        }
      >;
      'fd-select': ReactCustomElement<
        FdSelectElement,
        FdSelectAttributes & {
          'onfd-change'?: (event: CustomEvent<{ value: string; option: FdSelectOption }>) => void;
        }
      >;
      'fd-switch': ReactCustomElement<
        FdSwitchElement,
        FdSwitchAttributes & {
          'onfd-change'?: (event: CustomEvent<{ checked: boolean }>) => void;
        }
      >;
      'fd-tabs': ReactCustomElement<
        FdTabsElement,
        FdTabsAttributes & {
          'onfd-change'?: (event: CustomEvent<{ value: string; item: FdTabItem }>) => void;
        }
      >;
    }
  }
}

declare module 'vue' {
  export interface GlobalComponents {
    'fd-text-field': DefineComponent<FdTextFieldAttributes>;
    'fd-select': DefineComponent<FdSelectAttributes>;
    'fd-switch': DefineComponent<FdSwitchAttributes>;
    'fd-tabs': DefineComponent<FdTabsAttributes>;
  }
}

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'fd-text-field': SolidCustomElement<
        FdTextFieldElement,
        FdTextFieldAttributes & {
          'on:fd-input'?: (event: CustomEvent<{ value: string }>) => void;
          'on:fd-change'?: (event: CustomEvent<{ value: string }>) => void;
          'on:fd-clear'?: (event: CustomEvent<{ value: string }>) => void;
        }
      >;
      'fd-select': SolidCustomElement<
        FdSelectElement,
        FdSelectAttributes & {
          'on:fd-change'?: (event: CustomEvent<{ value: string; option: FdSelectOption }>) => void;
        }
      >;
      'fd-switch': SolidCustomElement<
        FdSwitchElement,
        FdSwitchAttributes & {
          'on:fd-change'?: (event: CustomEvent<{ checked: boolean }>) => void;
        }
      >;
      'fd-tabs': SolidCustomElement<
        FdTabsElement,
        FdTabsAttributes & {
          'on:fd-change'?: (event: CustomEvent<{ value: string; item: FdTabItem }>) => void;
        }
      >;
    }
  }
}
