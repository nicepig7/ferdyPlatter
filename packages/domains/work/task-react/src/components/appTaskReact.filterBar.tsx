import { useMemo } from 'react';
import type { FdTabItem } from '@ferdy/ui/elements';
import {
  CATEGORY_LABEL,
  CATEGORY_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '../common/appTaskReact.constants';
import type { CategoryFilter, StatusFilter, TaskCounts } from '../common/appTaskReact.types';
import './appTaskReact.filterBar.css';

interface TaskFilterBarProps {
  statusFilter: StatusFilter;
  categoryFilter: CategoryFilter;
  searchQuery: string;
  counts: TaskCounts;
  isBusy: boolean;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onCategoryFilterChange: (filter: CategoryFilter) => void;
  onSearchQueryChange: (query: string) => void;
  onResetSeed: () => void;
}

export function TaskFilterBar({
  statusFilter,
  categoryFilter,
  searchQuery,
  counts,
  isBusy,
  onStatusFilterChange,
  onCategoryFilterChange,
  onSearchQueryChange,
  onResetSeed,
}: TaskFilterBarProps) {
  const statusTabItems = useMemo<FdTabItem[]>(
    () =>
      STATUS_FILTER_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        count: counts[option.value],
      })),
    [counts]
  );

  return (
    <section className="task-filter-bar" aria-label="필터 및 검색">
      <div className="task-filter-row">
        <fd-tabs
          items={statusTabItems}
          value={statusFilter}
          variant="pill"
          size="sm"
          aria-label="상태 필터"
          onfd-change={(e) => onStatusFilterChange(e.detail.value as StatusFilter)}
        />

        <div className="task-filter-right">
          <fd-text-field
            className="task-search-field"
            size="sm"
            left-icon="search"
            clearable
            placeholder="제목 / 메모 검색..."
            value={searchQuery}
            aria-label="키워드 검색"
            onfd-input={(e) => onSearchQueryChange(e.detail.value)}
            onfd-clear={() => onSearchQueryChange('')}
          />

          <button
            type="button"
            className="fd-btn fd-btn--sm fd-btn--neutral"
            onClick={onResetSeed}
            disabled={isBusy}
            title="초기 시드 데이터로 복원"
          >
            <i className="task-icon task-icon--sm icon-rotate-ccw" aria-hidden="true" />
            <span>Reset Seed</span>
          </button>
        </div>
      </div>

      <div className="task-category-pills" role="group" aria-label="분류 필터">
        <button
          type="button"
          className={`task-category-pill${categoryFilter === 'all' ? ' is-active' : ''}`}
          onClick={() => onCategoryFilterChange('all')}
        >
          All
        </button>
        {CATEGORY_OPTIONS.map((category) => (
          <button
            key={category}
            type="button"
            className={`task-category-pill${categoryFilter === category ? ' is-active' : ''}`}
            onClick={() => onCategoryFilterChange(category)}
          >
            {CATEGORY_LABEL[category]}
          </button>
        ))}
      </div>
    </section>
  );
}
