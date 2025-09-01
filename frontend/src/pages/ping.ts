import { pingGateway } from "../services/api"

export function Ping(): string {
    const containerId = "gateway-status";

    pingGateway().then((msg) => {
        const el = document.getElementById(containerId);
        if (el)
            el.innerText = msg;
    });
    
    return `
        <h1>System Status</h1>
        <p id="${containerId}">Checking gateway...</p>
    `;
}