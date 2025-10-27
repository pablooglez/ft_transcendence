import type { FastifyInstance } from "fastify"
import { 
    advanceTournamentController,
    createLocalTournamentController,
    startTournamentController,
    startRemoteTournamentController,
    createRemoteTournamentController,
    getTournamentsController,
    joinTournamentController,
    getTournamentPlayersController,
    leaveTournamentController,
    getTournamentByIdController,
    /*finishTournamentController,
    updateMatchResultController,
    getTournamentMatchesController,
    deleteTournamentController,*/
 } from "./../controllers/tournamentController"


export default async function tournamentRoutes(app: FastifyInstance) {

    app.get("/tournaments", getTournamentsController);
    app.get("/tournaments/:id", getTournamentByIdController);
    app.post("/tournaments/local", createLocalTournamentController);
    app.post("/tournaments/:id/start", startTournamentController);
    app.post("/tournaments/:id/start-remote", startRemoteTournamentController);
    app.post("/tournaments/:id/advance", advanceTournamentController);
    app.post("/tournaments/remote", createRemoteTournamentController);
    app.get("/tournaments/:id/join", joinTournamentController);
    app.get("/tournaments/:id/leave", leaveTournamentController);
    app.get("/tournaments/:id/players", getTournamentPlayersController);
    /*app.delete("/tournament/:id", deleteTournamentController);


    app.post("/tournaments/:id/finish", finishTournamentController)

    app.post("/tournaments/:id/matches", getTournamentMatchesController);
    app.patch("/matches/:matchId/result", updateMatchResultController);*/

}