import { Component, For, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { fd } from '@ferdy/ui';
import './appNotes.css';

const NOTES_STORAGE_KEY = 'ferdy:notes:items';
const ACTIVE_NOTE_STORAGE_KEY = 'ferdy:notes:active-id';
const NOTES_FONT_SIZE_STORAGE_KEY = 'ferdy:notes:font-size';

const MIN_FONT_SIZE = 11;
const MAX_FONT_SIZE = 28;
const DEFAULT_FONT_SIZE = 14;
const FONT_SIZE_STEP = 1;

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

type ViewMode = 'edit' | 'preview';

function createNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createEmptyNote(): NoteItem {
  return {
    id: createNoteId(),
    title: '',
    content: '',
    updatedAt: Date.now(),
  };
}

function createDefaultNotes(): NoteItem[] {
  const now = Date.now();
  return [
    {
      id: 'welcome-note',
      title: 'Ferdy Notes 시작하기',
      content: [
        '# Ferdy Notes',
        '',
        '브라우저 `localStorage`에 **실시간 자동 저장**되는 마크다운 메모장입니다.',
        '',
        '## 주요 기능',
        '- [x] 다중 메모 추가, 전환, 삭제 (좌측 사이드바)',
        '- [x] `Edit` ↔ `Preview` 마크다운 미리보기 전환',
        '- [ ] 나만의 첫 번째 메모 작성해보기',
        '',
        '> 상단의 **Preview** 버튼을 누르면 마크다운 서식이 깔끔하게 렌더링됩니다.',
        '',
        '```ts',
        "const message = 'Hello, Ferdy Platter!';",
        'console.log(message);',
        '```',
      ].join('\n'),
      updatedAt: now,
    },
    {
      id: 'quick-scratchpad',
      title: '빠른 스크래치패드',
      content: [
        '### 오늘의 할 일',
        '1. 아이디어 빠르게 기록하기',
        '2. **중요한 내용** 강조 표시하기',
        '3. ~~끝난 작업~~ 정리하기',
      ].join('\n'),
      updatedAt: now - 60_000,
    },
  ];
}

/**
 * Draft 스토리지 헬퍼: localStorage에서 저장된 메모 목록을 불러옵니다.
 * 추후 공용 스토리지/OPFS 계층으로 교체하기 쉽도록 컴포넌트와 분리해 유지합니다.
 */
function loadNotes(): NoteItem[] {
  try {
    const raw = window.localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return createDefaultNotes();

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createDefaultNotes();

    const validNotes: NoteItem[] = [];
    for (const item of parsed) {
      if (typeof item !== 'object' || item === null) continue;
      const record = item as Record<string, unknown>;
      if (
        typeof record.id === 'string' &&
        record.id.length > 0 &&
        typeof record.title === 'string' &&
        typeof record.content === 'string'
      ) {
        validNotes.push({
          id: record.id,
          title: record.title,
          content: record.content,
          updatedAt: typeof record.updatedAt === 'number' ? record.updatedAt : Date.now(),
        });
      }
    }

    return validNotes.length > 0 ? validNotes : createDefaultNotes();
  } catch {
    return createDefaultNotes();
  }
}

/** Draft 스토리지 헬퍼: 메모 목록을 localStorage에 저장합니다. */
function saveNotes(notes: NoteItem[]): void {
  try {
    window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // 스토리지 접근 제한 또는 용량 초과 시 UI 동작은 유지합니다.
  }
}

/** Draft 스토리지 헬퍼: 마지막으로 선택한 메모 ID를 불러옵니다. */
function loadActiveNoteId(availableNotes: NoteItem[]): string {
  try {
    const savedId = window.localStorage.getItem(ACTIVE_NOTE_STORAGE_KEY);
    if (savedId && availableNotes.some((n) => n.id === savedId)) {
      return savedId;
    }
  } catch {
    // 무시하고 첫 번째 메모를 선택합니다.
  }
  return availableNotes[0].id;
}

/** Draft 스토리지 헬퍼: 현재 선택한 메모 ID를 저장합니다. */
function saveActiveNoteId(id: string): void {
  try {
    window.localStorage.setItem(ACTIVE_NOTE_STORAGE_KEY, id);
  } catch {
    // 스토리지 접근 제한 시 무시합니다.
  }
}

/** Draft 스토리지 헬퍼: 에디터 폰트 크기를 불러옵니다. */
function loadFontSize(): number {
  try {
    const raw = window.localStorage.getItem(NOTES_FONT_SIZE_STORAGE_KEY);
    if (!raw) return DEFAULT_FONT_SIZE;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return DEFAULT_FONT_SIZE;
    return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(parsed)));
  } catch {
    return DEFAULT_FONT_SIZE;
  }
}

/** Draft 스토리지 헬퍼: 에디터 폰트 크기를 저장합니다. */
function saveFontSize(size: number): void {
  try {
    window.localStorage.setItem(NOTES_FONT_SIZE_STORAGE_KEY, String(size));
  } catch {
    // 스토리지 접근 제한 시 무시합니다.
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInlineMarkdown(rawText: string): string {
  const sanitized = rawText.replace(/[\uE000\uE001]/g, '');
  const tokens: string[] = [];
  const createToken = (html: string): string => {
    const index = tokens.length;
    tokens.push(html);
    return `\uE000${index}\uE001`;
  };

  // 1. 인라인 코드 내부는 다른 마크다운 강조 규칙이 적용되지 않도록 먼저 토큰화합니다.
  const withCodeTokens = sanitized.replace(/`([^`\n]+)`/g, (_, code: string) =>
    createToken(`<code>${escapeHtml(code)}</code>`)
  );

  // 2. HTML 특수문자를 이스케이프해 임의 태그/스크립트 삽입을 차단합니다.
  let escaped = escapeHtml(withCodeTokens);

  const applyEmphasis = (input: string): string =>
    input
      .replace(/~~([^~\n]+)~~/g, '<del>$1</del>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

  // 3. http/https 링크만 허용하여 javascript: URI 등 비안전 링크를 차단합니다.
  escaped = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi,
    (_, label: string, url: string) =>
      createToken(
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${applyEmphasis(label)}</a>`
      )
  );

  const formatted = applyEmphasis(escaped);
  const restore = (value: string): string =>
    value.replace(/\uE000(\d+)\uE001/g, (_, idx: string) => tokens[Number(idx)] ?? '');

  return restore(restore(formatted));
}

const CHECKLIST_RE = /^\s*[-*]\s+\[([ xX])\]\s+(.*)$/;
const UNORDERED_LIST_RE = /^\s*[-*]\s+(.*)$/;
const ORDERED_LIST_RE = /^\s*\d+\.\s+(.*)$/;
const HEADING_RE = /^(#{1,4})\s+(.*)$/;
const HR_RE = /^(?:---|\*\*\*|___)\s*$/;
const BLOCKQUOTE_RE = /^\s*>\s?(.*)$/;
const CODE_FENCE_RE = /^```/;

/** 경량 마크다운 텍스트를 안전한 HTML 문자열로 변환합니다. */
function renderMarkdownToHtml(markdown: string): string {
  if (!markdown.trim()) {
    return '<p class="md-empty">작성된 내용이 없습니다. Edit 모드에서 마크다운이나 텍스트를 입력해 보세요.</p>';
  }

  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const htmlParts: string[] = [];
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    htmlParts.push(`<p>${paragraphLines.map(renderInlineMarkdown).join('<br />')}</p>`);
    paragraphLines = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (CODE_FENCE_RE.test(line)) {
      flushParagraph();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !CODE_FENCE_RE.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && CODE_FENCE_RE.test(lines[i])) {
        i++;
      }
      htmlParts.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    if (/^\s*$/.test(line)) {
      flushParagraph();
      i++;
      continue;
    }

    if (HR_RE.test(line)) {
      flushParagraph();
      htmlParts.push('<hr />');
      i++;
      continue;
    }

    const headingMatch = line.match(HEADING_RE);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      htmlParts.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    if (BLOCKQUOTE_RE.test(line)) {
      flushParagraph();
      const quoteGroups: string[][] = [[]];
      while (i < lines.length) {
        const quoteMatch = lines[i].match(BLOCKQUOTE_RE);
        if (!quoteMatch) break;
        const text = quoteMatch[1];
        if (/^\s*$/.test(text)) {
          if (quoteGroups[quoteGroups.length - 1].length > 0) {
            quoteGroups.push([]);
          }
        } else {
          quoteGroups[quoteGroups.length - 1].push(text);
        }
        i++;
      }
      const quoteBody = quoteGroups
        .filter((group) => group.length > 0)
        .map((group) => `<p>${group.map(renderInlineMarkdown).join('<br />')}</p>`)
        .join('');
      htmlParts.push(`<blockquote>${quoteBody || '<p></p>'}</blockquote>`);
      continue;
    }

    if (CHECKLIST_RE.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length) {
        const checkMatch = lines[i].match(CHECKLIST_RE);
        if (!checkMatch) break;
        const checked = checkMatch[1].toLowerCase() === 'x';
        items.push(
          `<li class="md-check-item${checked ? ' is-checked' : ''}"><input type="checkbox" class="md-check-input" disabled${checked ? ' checked' : ''} /><span>${renderInlineMarkdown(checkMatch[2])}</span></li>`
        );
        i++;
      }
      htmlParts.push(`<ul class="md-checklist">${items.join('')}</ul>`);
      continue;
    }

    if (UNORDERED_LIST_RE.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length) {
        if (CHECKLIST_RE.test(lines[i])) break;
        const ulMatch = lines[i].match(UNORDERED_LIST_RE);
        if (!ulMatch) break;
        items.push(`<li>${renderInlineMarkdown(ulMatch[1])}</li>`);
        i++;
      }
      htmlParts.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (ORDERED_LIST_RE.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length) {
        const olMatch = lines[i].match(ORDERED_LIST_RE);
        if (!olMatch) break;
        items.push(`<li>${renderInlineMarkdown(olMatch[1])}</li>`);
        i++;
      }
      htmlParts.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    paragraphLines.push(line);
    i++;
  }

  flushParagraph();
  return htmlParts.join('');
}

function getDisplayTitle(title: string): string {
  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : '제목 없는 메모';
}

function getNoteSnippet(content: string): string {
  const firstLine = content
    .split('\n')
    .map((line) => line.replace(/^#{1,6}\s+|^>\s?|^[-*]\s+\[[ xX]\]\s+|^[-*]\s+|^\d+\.\s+/, '').trim())
    .find((line) => line.length > 0 && !line.startsWith('```'));
  return firstLine ?? '내용 없음';
}

function formatNoteTimestamp(timestamp: number): string {
  const target = new Date(timestamp);
  const now = new Date();
  const isToday =
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate();

  const hh = String(target.getHours()).padStart(2, '0');
  const min = String(target.getMinutes()).padStart(2, '0');

  if (isToday) {
    return `${hh}:${min}`;
  }

  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  return `${mm}.${dd} ${hh}:${min}`;
}

export const AppNotes: Component = () => {
  const initialNotes = loadNotes();
  const [notes, setNotes] = createSignal<NoteItem[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = createSignal<string>(loadActiveNoteId(initialNotes));
  const [viewMode, setViewMode] = createSignal<ViewMode>('edit');
  const [isSidebarOpen, setIsSidebarOpen] = createSignal<boolean>(true);
  const [fontSize, setFontSize] = createSignal<number>(loadFontSize());

  let titleInputRef: HTMLInputElement | undefined;
  let textareaRef: HTMLTextAreaElement | undefined;

  const updateFontSize = (nextSize: number) => {
    const clamped = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, nextSize));
    setFontSize(clamped);
    saveFontSize(clamped);
  };

  const changeFontSize = (delta: number) => {
    updateFontSize(fontSize() + delta);
  };

  const resetFontSize = () => {
    updateFontSize(DEFAULT_FONT_SIZE);
  };

  onMount(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (viewMode() !== 'edit') return;
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;

      if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
        e.preventDefault();
        changeFontSize(FONT_SIZE_STEP);
      } else if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        changeFontSize(-FONT_SIZE_STEP);
      } else if (e.key === '0' || e.code === 'Numpad0') {
        e.preventDefault();
        resetFontSize();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    onCleanup(() => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    });
  });

  const activeNote = createMemo<NoteItem>(() => {
    const list = notes();
    return list.find((n) => n.id === activeNoteId()) ?? list[0];
  });

  // 입력 중 DOM .value 재할당으로 인한 커서 점프를 막기 위해 실제 값이 다를 때만 동기화합니다.
  createEffect(() => {
    const note = activeNote();
    if (titleInputRef && titleInputRef.value !== note.title) {
      titleInputRef.value = note.title;
    }
    if (viewMode() === 'edit' && textareaRef && textareaRef.value !== note.content) {
      textareaRef.value = note.content;
    }
  });

  const renderedHtml = createMemo(() => renderMarkdownToHtml(activeNote().content));

  const charCount = createMemo(() => activeNote().content.length);
  const lineCount = createMemo(() => {
    const content = activeNote().content;
    return content.length === 0 ? 0 : content.split('\n').length;
  });

  const selectNote = (id: string) => {
    setActiveNoteId(id);
    saveActiveNoteId(id);
    if (textareaRef) {
      textareaRef.scrollTop = 0;
    }
  };

  const createNewNote = () => {
    const created = createEmptyNote();
    setNotes((prev) => {
      const next = [created, ...prev];
      saveNotes(next);
      return next;
    });
    selectNote(created.id);
    setViewMode('edit');
    queueMicrotask(() => {
      titleInputRef?.focus();
    });
  };

  const deleteNote = (id: string) => {
    const currentList = notes();
    const removedIndex = currentList.findIndex((n) => n.id === id);
    if (removedIndex === -1) return;

    const remaining = currentList.filter((n) => n.id !== id);
    if (remaining.length === 0) {
      const fallbackNote = createEmptyNote();
      const nextList = [fallbackNote];
      setNotes(nextList);
      saveNotes(nextList);
      selectNote(fallbackNote.id);
      setViewMode('edit');
      return;
    }

    setNotes(remaining);
    saveNotes(remaining);

    if (activeNoteId() === id) {
      const nextIndex = Math.min(removedIndex, remaining.length - 1);
      selectNote(remaining[nextIndex].id);
    }
  };

  const updateActiveNote = (patch: Partial<Pick<NoteItem, 'title' | 'content'>>) => {
    const targetId = activeNote().id;
    const updatedAt = Date.now();
    setNotes((prev) => {
      const next = prev.map((note) =>
        note.id === targetId ? { ...note, ...patch, updatedAt } : note
      );
      saveNotes(next);
      return next;
    });
  };

  const handleTextareaKeyDown = (
    e: KeyboardEvent & { currentTarget: HTMLTextAreaElement; target: Element }
  ) => {
    if (e.key !== 'Tab' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    e.preventDefault();
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const nextValue = `${value.slice(0, start)}  ${value.slice(end)}`;
    textarea.value = nextValue;
    textarea.selectionStart = start + 2;
    textarea.selectionEnd = start + 2;
    updateActiveNote({ content: nextValue });
  };

  return (
    <div class="app-notes">
      <header class="notes-header">
        <div class="notes-header-left">
          <fd.Button
            variant="neutral"
            size="sm"
            class="notes-icon-btn"
            aria-label={isSidebarOpen() ? '메모 목록 숨기기' : '메모 목록 펼치기'}
            aria-pressed={isSidebarOpen()}
            title={isSidebarOpen() ? '메모 목록 숨기기' : '메모 목록 펼치기'}
            onClick={() => setIsSidebarOpen((open) => !open)}
          >
            <fd.Icon name="panel-left" size="sm" />
          </fd.Button>

          <div class="notes-brand">
            <fd.Icon name="notebook-pen" size="md" class="notes-brand-icon" />
            <span class="notes-brand-title">Notes</span>
          </div>

          <fd.Badge variant="neutral" class="notes-count-badge">
            {notes().length}
          </fd.Badge>

          <fd.Button variant="primary" size="sm" onClick={createNewNote} title="새 메모 추가">
            <fd.Icon name="plus" size="xs" />
            <span>새 메모</span>
          </fd.Button>
        </div>

        <div class="notes-header-right">
          <div class="notes-mode-group" role="group" aria-label="보기 모드 전환">
            <fd.Button
              variant={viewMode() === 'edit' ? 'accent-ghost' : 'neutral'}
              size="sm"
              class="notes-mode-btn"
              aria-pressed={viewMode() === 'edit'}
              onClick={() => setViewMode('edit')}
            >
              <fd.Icon name="pencil" size="xs" />
              <span>Edit</span>
            </fd.Button>
            <fd.Button
              variant={viewMode() === 'preview' ? 'secondary-ghost' : 'neutral'}
              size="sm"
              class="notes-mode-btn"
              aria-pressed={viewMode() === 'preview'}
              onClick={() => setViewMode('preview')}
            >
              <fd.Icon name="eye" size="xs" />
              <span>Preview</span>
            </fd.Button>
          </div>

          <fd.Button
            variant="danger"
            size="sm"
            class="notes-icon-btn"
            aria-label="현재 메모 삭제"
            title="현재 메모 삭제"
            onClick={() => deleteNote(activeNote().id)}
          >
            <fd.Icon name="trash-2" size="sm" />
          </fd.Button>
        </div>
      </header>

      <div class="notes-body">
        <Show when={isSidebarOpen()}>
          <aside class="notes-sidebar" aria-label="메모 목록">
            <div class="notes-list">
              <For each={notes()}>
                {(note) => (
                  <div
                    class="notes-list-item"
                    classList={{ 'is-active': note.id === activeNote().id }}
                  >
                    <button
                      type="button"
                      class="notes-item-select"
                      aria-current={note.id === activeNote().id ? 'true' : undefined}
                      onClick={() => selectNote(note.id)}
                    >
                      <span class="notes-item-title">{getDisplayTitle(note.title)}</span>
                      <span class="notes-item-snippet">{getNoteSnippet(note.content)}</span>
                      <span class="notes-item-time">
                        {formatNoteTimestamp(note.updatedAt)}
                      </span>
                    </button>
                    <button
                      type="button"
                      class="notes-item-delete"
                      aria-label={`${getDisplayTitle(note.title)} 삭제`}
                      title="메모 삭제"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                    >
                      <fd.Icon name="x" size="xs" />
                    </button>
                  </div>
                )}
              </For>
            </div>
          </aside>
        </Show>

        <main class="notes-main">
          <div class="notes-title-bar">
            <input
              ref={(el) => {
                titleInputRef = el;
                el.value = activeNote().title;
              }}
              type="text"
              class="notes-title-input"
              classList={{ 'is-readonly': viewMode() === 'preview' }}
              placeholder="제목을 입력하세요..."
              aria-label="메모 제목"
              readOnly={viewMode() === 'preview'}
              onInput={(e) => updateActiveNote({ title: e.currentTarget.value })}
            />
          </div>

          <div class="notes-content-area">
            <Show
              when={viewMode() === 'edit'}
              fallback={<div class="notes-preview" innerHTML={renderedHtml()} />}
            >
              <textarea
                ref={(el) => {
                  textareaRef = el;
                  el.value = activeNote().content;
                }}
                class="notes-textarea"
                style={{ 'font-size': `${fontSize()}px` }}
                placeholder="마크다운(# 제목, **굵게**, - [ ] 체크리스트, ```코드```) 또는 일반 텍스트를 입력하세요..."
                aria-label="메모 본문"
                spellcheck={false}
                onInput={(e) => updateActiveNote({ content: e.currentTarget.value })}
                onKeyDown={handleTextareaKeyDown}
              />
            </Show>
          </div>
        </main>
      </div>

      <footer class="notes-footer">
        <div class="notes-footer-status">
          <fd.Icon name="check" size="xs" class="notes-saved-icon" />
          <span>
            자동 저장됨 · {formatNoteTimestamp(activeNote().updatedAt)}
          </span>
        </div>
        <div class="notes-footer-right">
          <Show when={viewMode() === 'edit'}>
            <div class="notes-font-controls" role="group" aria-label="에디터 글자 크기 조절">
              <button
                type="button"
                class="notes-font-btn"
                disabled={fontSize() <= MIN_FONT_SIZE}
                aria-label="글자 크기 줄이기 (Ctrl+-)"
                title="글자 크기 줄이기 (Ctrl+-)"
                onClick={() => changeFontSize(-FONT_SIZE_STEP)}
              >
                <fd.Icon name="minus" size="xs" />
              </button>
              <button
                type="button"
                class="notes-font-value"
                aria-label={`현재 글자 크기 ${fontSize()}px, 클릭 시 기본 크기로 초기화 (Ctrl+0)`}
                title="기본 크기(14px)로 초기화 (Ctrl+0)"
                onClick={resetFontSize}
              >
                {fontSize()}px
              </button>
              <button
                type="button"
                class="notes-font-btn"
                disabled={fontSize() >= MAX_FONT_SIZE}
                aria-label="글자 크기 키우기 (Ctrl++)"
                title="글자 크기 키우기 (Ctrl++)"
                onClick={() => changeFontSize(FONT_SIZE_STEP)}
              >
                <fd.Icon name="plus" size="xs" />
              </button>
            </div>
          </Show>
          <div class="notes-footer-stats">
            <span>{charCount()}자</span>
            <span aria-hidden="true">·</span>
            <span>{lineCount()}줄</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppNotes;
