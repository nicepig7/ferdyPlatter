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
  return (
    <section className="task-filter-bar" aria-label="필터 및 검색">
      <div className="task-filter-row">
        <div className="task-tabs" role="tablist" aria-label="상태 필터">
          {STATUS_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={statusFilter === option.value}
              className={`task-tab${statusFilter === option.value ? ' is-active' : ''}`}
              onClick={() => onStatusFilterChange(option.value)}
            >
              <span>{option.label}</span>
              <span className="task-tab-count">{counts[option.value]}</span>
            </button>
          ))}
        </div>

        <div className="task-filter-right">
          <div className="task-search-box">
            <i
              className="task-icon task-icon--sm task-search-icon icon-search"
              aria-hidden="true"
            />
            <input
              type="text"
              className="task-search-input"
              placeholder="제목 / 메모 검색..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              aria-label="키워드 검색"
            />
            {searchQuery && (
              <button
                type="button"
                className="task-search-clear"
                onClick={() => onSearchQueryChange('')}
                aria-label="검색어 지우기"
                title="검색어 지우기"
              >
                <i className="task-icon task-icon--sm icon-x" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="button"
            className="task-reset-btn"
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
