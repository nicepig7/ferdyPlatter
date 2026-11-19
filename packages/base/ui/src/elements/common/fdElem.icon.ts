import { html, nothing, TemplateResult } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleAlert,
  CircleCheck,
  Clock,
  Columns2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Folder,
  Info,
  Lightbulb,
  ListTodo,
  Lock,
  Mail,
  Minus,
  Pencil,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  Trash2,
  TriangleAlert,
  User,
  X,
} from 'lucide-static';

const ICON_REGISTRY = new Map<string, string>([
  ['alert-circle', AlertCircle],
  ['alert-triangle', AlertTriangle],
  ['book-open', BookOpen],
  ['briefcase', Briefcase],
  ['calendar', Calendar],
  ['check', Check],
  ['check-circle-2', CheckCircle2],
  ['chevron-down', ChevronDown],
  ['chevron-left', ChevronLeft],
  ['chevron-right', ChevronRight],
  ['chevron-up', ChevronUp],
  ['circle', Circle],
  ['circle-alert', CircleAlert],
  ['circle-check', CircleCheck],
  ['clock', Clock],
  ['columns-2', Columns2],
  ['copy', Copy],
  ['external-link', ExternalLink],
  ['eye', Eye],
  ['eye-off', EyeOff],
  ['folder', Folder],
  ['info', Info],
  ['lightbulb', Lightbulb],
  ['list-todo', ListTodo],
  ['lock', Lock],
  ['mail', Mail],
  ['minus', Minus],
  ['pencil', Pencil],
  ['plus', Plus],
  ['search', Search],
  ['settings', Settings],
  ['sliders-horizontal', SlidersHorizontal],
  ['sparkles', Sparkles],
  ['star', Star],
  ['tag', Tag],
  ['trash-2', Trash2],
  ['triangle-alert', TriangleAlert],
  ['user', User],
  ['x', X],
]);

/**
 * Normalizes icon names such as `icon-search` or `CircleCheck` into kebab-case keys.
 */
export function normalizeFdIconName(name: string): string {
  return name
    .trim()
    .replace(/^icon-/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Strips leading license comments and normalizes SVG dimensions to fill its wrapper.
 */
function sanitizeLucideSvg(rawSvg: string, size: number): string {
  return rawSvg
    .replace(/<!--[\s\S]*?-->\s*/g, '')
    .replace(/\bwidth="[^"]*"/, `width="${size}"`)
    .replace(/\bheight="[^"]*"/, `height="${size}"`);
}

/**
 * Registers additional Lucide or custom inline SVG strings for Shadow DOM elements.
 */
export function registerFdIcons(icons: Record<string, string>): void {
  for (const [key, svg] of Object.entries(icons)) {
    ICON_REGISTRY.set(normalizeFdIconName(key), svg);
  }
}

/**
 * Returns the cleaned inline `<svg>` string for a registered icon name, or `null`.
 */
export function getFdIconSvg(name?: string, size = 16): string | null {
  if (!name) return null;
  const raw = ICON_REGISTRY.get(normalizeFdIconName(name));
  if (!raw) return null;
  return sanitizeLucideSvg(raw, size);
}

/**
 * Renders a registered `lucide-static` icon as an inline `<svg>` inside Shadow DOM.
 */
export function renderFdIcon(
  name?: string,
  size = 16,
  className = '',
): TemplateResult | typeof nothing {
  const svg = getFdIconSvg(name, size);
  if (!svg) return nothing;

  const classes = className ? `fd-elem-icon ${className}` : 'fd-elem-icon';
  return html`<span
    class=${classes}
    aria-hidden="true"
    style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;flex-shrink:0;line-height:1;"
    >${unsafeHTML(svg)}</span
  >`;
}

/**
 * Renders a named `<slot>` with an inline Lucide SVG fallback when no light-DOM icon is slotted.
 */
export function renderFdIconSlot(
  slotName: string,
  iconName?: string,
  size = 16,
  className = '',
): TemplateResult {
  return html`<slot name=${slotName}>${renderFdIcon(iconName, size, className)}</slot>`;
}
