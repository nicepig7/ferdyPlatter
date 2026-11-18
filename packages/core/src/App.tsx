import { Component, onCleanup, onMount } from 'solid-js';
import { Desktop } from './components/desktop/fdShell.desktop';
import { Taskbar } from './components/taskbar/fdShell.taskbar';
import { registerCoreBridgeHandlers } from './services/bridge/fdCore.bridge.service';

export const App: Component = () => {
  onMount(() => {
    const unregisterBridge = registerCoreBridgeHandlers();
    onCleanup(unregisterBridge);
  });

  return (
    <div class="os-shell-root">
      <Desktop />
      <Taskbar />
    </div>
  );
};
