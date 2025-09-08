import { router } from "./router";
import { registerHandlers } from "./pages/register"
import { loginHandlers } from "./pages/login"
import { homeText } from "./pages/home"
import { pongHandlers } from "./pages/pong";

function render() {
    const app = document.getElementById("app")!;
    app.innerHTML = router(window.location.hash);
    const header = document.getElementById("header")!;
    header.className = "";
    const home = document.getElementById("home")!;
    home.innerHTML = "";
    if (location.hash === "" || location.hash === "#/" || location.hash === "#/home")
    {
        const home = document.getElementById("home")!;
        home.innerHTML = homeText();
        const header = document.getElementById("header")!;
        header.className = "header-home";
    }

    if (location.hash === "#/register")
        registerHandlers();
    if (location.hash === "#/login")
        loginHandlers();
	if (location.hash === "#/pong") {
        pongHandlers();
    }
    if (location.hash === "" || location.hash === "#/" || location.hash === "#/home") {
        import("./pages/home").then(mod => mod.handleStars());
    }
}

window.addEventListener("hashchange", render);
window.addEventListener("load", render);