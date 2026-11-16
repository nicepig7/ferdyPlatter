/* @refresh reload */
import { render } from 'solid-js/web';
import { App } from './App';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element #root not found in index.html');
}

render(() => <App />, root);

