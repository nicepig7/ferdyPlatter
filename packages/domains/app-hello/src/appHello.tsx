import { FERDY_ASSETS } from "@ferdy/assets";
import "./appHello.css";

export default function () {
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
}