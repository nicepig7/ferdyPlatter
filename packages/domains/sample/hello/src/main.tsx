/* @refresh reload */
import { render } from 'solid-js/web';
import '@ferdy/ui/styles.css';
import { AppHello } from './appHello';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found');
}

render(() => <AppHello />, root);
