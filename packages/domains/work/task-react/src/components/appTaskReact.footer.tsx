import './appTaskReact.footer.css';

interface TaskFooterProps {
  filteredCount: number;
  totalCount: number;
}

export function TaskFooter({ filteredCount, totalCount }: TaskFooterProps) {
  return (
    <footer className="task-footer">
      <span className="task-footer-count">
        Showing {filteredCount} of {totalCount} tasks
      </span>
      <span className="task-footer-sync">
        <span className="task-footer-sync-dot" aria-hidden="true" />
        <span>Synced via @ferdy/extern-task</span>
      </span>
    </footer>
  );
}
