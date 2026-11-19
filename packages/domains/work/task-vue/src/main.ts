import { createApp } from 'vue';
import '@ferdy/ui/styles.css';
import '@ferdy/ui/elements';
import AppTaskVue from './appTaskVue.vue';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found');
}

createApp(AppTaskVue).mount(root);
