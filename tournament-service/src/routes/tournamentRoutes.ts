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
    updateMatchRoomController,
    getTournamentMatchesWithRoomsController,
    getMatchByIdController,
    updateMatchResultController
    /*finishTournamentController,
    getTournamentMatchesController,
    deleteTournamentController,*/
 } from "./../controllers/tournamentController"
import { updateRemoteMatchResultController } from "./../controllers/remoteTournamentController"
import { advanceTournamentSchema, 
         createLocalTournamentSchema, 
         createRemoteTournamentSchema, 
         getMatchByIdSchema, 
         getTournamentByIdSchema, 
         getTournamentMatchesWithRoomsSchema, 
         getTournamentPlayersSchema, 
         getTournamentsSchema, 
         joinTournamentSchema, 
         leaveTournamentSchema, 
         startRemoteTournamentSchema, 
         startTournamentSchema,
         updateMatchResultSchema,
         updateMatchRoomSchema, } from "../schemas/tournamentSchemas";


export default async function tournamentRoutes(app: FastifyInstance) {

    app.get("/tournaments", { schema: getTournamentsSchema }, getTournamentsController);
    app.get("/tournaments/:id", { schema: getTournamentByIdSchema }, getTournamentByIdController);
    app.post("/tournaments/local", { schema: createLocalTournamentSchema }, createLocalTournamentController);
    app.post("/tournaments/:id/start", { schema: startTournamentSchema }, startTournamentController);
    app.post("/tournaments/:id/start-remote", { schema: startRemoteTournamentSchema }, startRemoteTournamentController);
    app.post("/tournaments/:id/advance", { schema: advanceTournamentSchema }, advanceTournamentController);
    app.post("/tournaments/remote", { schema: createRemoteTournamentSchema }, createRemoteTournamentController);
    app.get("/tournaments/:id/join", { schema: joinTournamentSchema }, joinTournamentController);
    app.get("/tournaments/:id/leave", { schema: leaveTournamentSchema }, leaveTournamentController);
    app.get("/tournaments/:id/players", { schema: getTournamentPlayersSchema }, getTournamentPlayersController);
    app.put("/tournaments/matches/:matchId/room", { schema: updateMatchRoomSchema }, updateMatchRoomController);
    app.get("/tournaments/:id/matches", { schema: getTournamentMatchesWithRoomsSchema }, getTournamentMatchesWithRoomsController);
    app.get("/tournaments/matches/:matchId", { schema: getMatchByIdSchema }, getMatchByIdController);

    // Use remote controller for remote tournaments, regular controller for local
    app.patch(
    "/tournaments/matches/:matchId/result",
    { schema: updateMatchResultSchema },
    async (req, reply) => {
        const { matchId } = req.params as { matchId: string };

        const match = await import("../repositories/tournamentRepository")
        .then(repo => repo.TournamentRepository.getMatchById(Number(matchId)));

        if (match) {
        const tournament = await import("../repositories/tournamentRepository")
            .then(repo => repo.TournamentRepository.getById(match.tournament_id));
        
        if (tournament && tournament.mode === 'remote') {
            return updateRemoteMatchResultController(req, reply);
        }
        }

        // Default to local controller
        return updateMatchResultController(req, reply);
    }
    );

}