import { Home } from "./pages/home";
import { About } from "./pages/about";
import { Register } from "./pages/register";
import { Login } from "./pages/login";
import { Health, healthHandlers } from "./pages/health";
import { Ping } from "./pages/ping";

export function router(route: string): string {
    switch (route) {
        case "#/about":
            return About();
        case "#/register":
            return Register();
        case "#/login":
            return Login();
        case "#/health":
            setTimeout(healthHandlers, 0);
            return Health();
        case "#/ping":
            return Ping();
        case "#/":
        default:
            return Home();
    }
}