import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@ferdy/ui/styles.css';
import '@ferdy/ui/elements';
import { AppTaskReact } from './appTaskReact';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found');
}

createRoot(root).render(
  <StrictMode>
    <AppTaskReact />
  </StrictMode>
);
