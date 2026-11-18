import { render } from 'solid-js/web';
import '@ferdy/ui/styles.css';
import App from './appHello';

const root = document.getElementById('root');
if (root) {
  render(() => <App />, root);
}
