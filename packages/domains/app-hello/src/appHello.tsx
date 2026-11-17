import { Component } from 'solid-js';
import { FERDY_ASSETS } from '@ferdy/assets';
import './appHello.css';

export const AppHello: Component = () => {
  return (
    <div class="app-hello">
      <h1>Hello World.</h1>
      <img
        src={FERDY_ASSETS.paths.logoSvg}
        alt="Ferdy Platter Logo"
        class="app-hello-logo"
      />
    </div>
  );
};

export default AppHello;
