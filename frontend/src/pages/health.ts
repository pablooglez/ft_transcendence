import { getAccessToken } from "../state/authState"

export function Health(): string {
    return `
        <h1>Gateway Health</h1>
        <p id="health-status">Checking...</p>
        <button id="check-health">Refresh</button>
    `;
}

export function healthHandlers() {
    const statusEl = document.getElementById("health-status")!;
    const button = document.getElementById("check-health")!;

    async function updateHealth() {
        const token = getAccessToken();
        try {
            const res = await fetch("http://localhost:8080/health", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            statusEl.textContent = `Status: ${data.status}, Uptime: ${data.uptime.toFixed(2)}s`;
        } catch (err) {
            statusEl.textContent = `Failed to fetch health: ${(err as Error).message}`;
        }
    }

    button.onclick = updateHealth;

    // optional: check immediately
    updateHealth();
}