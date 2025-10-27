import { getAccessToken } from "../../state/authState";
import { getTournamentLobbyHTML } from "./tournamentTemplate";

const apiHost = `${window.location.hostname}`;

export async function createRemoteTournament(tournamentName: string, tournamentPlayers: number) {
    const token = getAccessToken();
    
    const tournament = await fetch(`http://${apiHost}:8080/tournaments/remote`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
         },
        body: JSON.stringify({ tournamentName, tournamentPlayers}),
        credentials: "include",
    });

    const tournamentData = await tournament.json();
    console.log("TournamentData:", tournamentData);
    return tournamentData.tournament.id;
}

export async function getRemoteTournamentData(tournamentId: number) {
    const token = getAccessToken();
    
    const tournament = await fetch(`http://${apiHost}:8080/tournaments/${tournamentId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
         },
        credentials: "include",
    });

    const tournamentData = await tournament.json();
    console.log("One tournament Data:", tournamentData);
    return tournamentData;
}

export async function getRemoteTournaments() {
    const token = getAccessToken();
    
    const tournaments = await fetch(`http://${apiHost}:8080/tournaments`, {
        method: "GET",
        headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
         },
        credentials: "include",
    });

    const tournamentList = await tournaments.json();
    console.log("TournamentList:", tournamentList);
    return (tournamentList);
}

export async function loadTournamentPlayers(tournamentId: number) {
    const token = getAccessToken();
    
    try {
        const players = await fetch(`http://${apiHost}:8080/tournaments/${tournamentId}/players`, {
            method: "GET",
            headers: { "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            credentials: "include",
        });

        const tournament = await fetch(`http://${apiHost}:8080/tournaments/${tournamentId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            credentials: "include",
        });

        const playersData = await players.json();
        const tournamentData = await tournament.json();
        const list = document.getElementById("player-list");
        if (list) {
            list.innerHTML = "";

            if (playersData.length === 0) {
                list.innerHTML = "<li>No players joined yet."
                return ;
            }

            for (const player of playersData) {
                const li = document.createElement("li");
                li.textContent = player.username;
                list.appendChild(li);
            }

            if (playersData.length === tournamentData.max_players / 2) {
                const startBtn = document.getElementById("start-btn") as HTMLButtonElement | null;
                if (startBtn && startBtn.disabled === true)
                    startBtn.disabled = false;
            }
        }
    } catch (err) {
        console.error("Failed to load players:", err);
    }
}

