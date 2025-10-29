// Página para mostrar estadísticas de una partida concreta: #/match/{id}
import * as api from "../services/api";

export function MatchStatsPage(): string {
  return `
    <div class="match-stats-page">
      <button id="match-back-btn">← Volver</button>
      <div id="match-stats">Cargando partida...</div>
    </div>
  `;
}

function parseMatchIdFromHash(): string | null {
  const hash = window.location.hash || '';
  const m = hash.match(/^#\/match\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function matchStatsHandlers() {
  (async () => {
    const container = document.getElementById('match-stats');
    const backBtn = document.getElementById('match-back-btn');
    if (backBtn) backBtn.addEventListener('click', () => window.history.back());
    if (!container) return;
    container.innerHTML = 'Cargando partida...';

    const matchId = parseMatchIdFromHash();
    if (!matchId) {
      container.innerHTML = `<span style="color:red">Match id inválido en la URL</span>`;
      return;
    }

    try {
      // Try using api helper if available
      let matchData: any = null;
      if ((api as any).getMatchById) {
        matchData = await (api as any).getMatchById(matchId);
      } else {
        // Fallback: plain fetch to /matches/:id (gateway should proxy)
        const resp = await fetch(`/matches/${encodeURIComponent(matchId)}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        matchData = await resp.json();
      }

      // Render basic stats (adjust according to the server fields)
      const leftName = matchData.leftName ?? matchData.left ?? matchData.playerLeft ?? 'Left';
      const rightName = matchData.rightName ?? matchData.right ?? matchData.playerRight ?? 'Right';
      const scoreLeft = matchData.score_left ?? matchData.leftScore ?? 0;
      const scoreRight = matchData.score_right ?? matchData.rightScore ?? 0;
      const duration = matchData.duration ?? matchData.playTime ?? 'N/A';
      const created = matchData.timestamp ? new Date(matchData.timestamp).toLocaleString() : (matchData.createdAt ? new Date(matchData.createdAt).toLocaleString() : 'N/A');

      container.innerHTML = `
        <h2>Match ${matchId}</h2>
        <div class="match-summary">
          <div><strong>${leftName}</strong> — ${scoreLeft}</div>
          <div><strong>${rightName}</strong> — ${scoreRight}</div>
        </div>
        <div class="match-meta">
          <div>Duración: ${duration}</div>
          <div>Fecha: ${created}</div>
          <div>Winner: ${matchData.winner ?? (scoreLeft > scoreRight ? leftName : (scoreRight > scoreLeft ? rightName : 'Draw'))}</div>
        </div>
        <div class="match-events">
          <h3>Eventos</h3>
          <ul>
            ${(Array.isArray(matchData.events) ? matchData.events : []).map((e: any) => `<li>${e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ''} - ${e.type}: ${e.detail ?? JSON.stringify(e)}</li>`).join('')}
          </ul>
        </div>
      `;
    } catch (err: any) {
      console.error(err);
      container.innerHTML = `<span style="color:red">Error cargando la partida: ${err.message ?? err}</span>`;
    }
  })();
}