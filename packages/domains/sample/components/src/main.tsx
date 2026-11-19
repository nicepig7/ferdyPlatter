/* @refresh reload */
import { render } from 'solid-js/web';
import '@ferdy/ui/styles.css';
import '@ferdy/ui/elements';
import { AppComponents } from './smpCompo.app';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found');
}

render(() => <AppComponents />, root);
