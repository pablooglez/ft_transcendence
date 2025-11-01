import { FastifyInstance } from "fastify";
import { createRoom } from "../services/roomService";
import { getRoom, getAllRooms, saveRoom, saveMatch, getMatchesByPlayer } from "../db/roomRepository";
import { scheduleAutoDeleteIfEmpty } from "../services/publicRoomtimers";

export async function roomRoutes(fastify: FastifyInstance) {
  // Endpoint to add player to room
  fastify.post("/rooms/:id/add-player", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { playerId } = request.body as { playerId: string };
    const room = getRoom(id);
    if (!room) return reply.code(404).send({ error: "Room not found" });
    // Add player if not already in room
    const players = room.players.includes(playerId) ? room.players : [...room.players, playerId];
    saveRoom(id, room.state, players, (room as any).public === true);
    reply.send({ success: true, roomId: id, players });
  });
  fastify.post("/rooms", async (request, reply) => {
    const roomId = createRoom();
    // initialize in database with empty state and no players
    reply.send({ roomId });
  });

  // new endpoint to create remote rooms (persistent)
  fastify.post("/remote-rooms", async (request, reply) => {
    // Read requested public flag from body (default true)
    const body = request.body as any || {};
    const isPublic = typeof body.public === 'boolean' ? body.public : true;

    // If client requests a private room, require Authorization header (JWT) to be present
    if (!isPublic) {
      const auth = (request.headers as any)['authorization'] || request.headers['Authorization'];
      if (!auth) return reply.code(401).send({ error: 'Authorization required to create private room' });
      // NOTE: minimal implementation requires header presence; optional token verification can be added later
    }

    // Unique id
    const roomId = `room_${Math.random().toString(36).substring(2, 10)}`;
    // persist with public flag
    saveRoom(roomId, {}, [], isPublic);

    // SCHEDULE AUTO-DELETE FOR PUBLIC ROOMS (60s) — new behavior
    if (isPublic) {
      scheduleAutoDeleteIfEmpty(roomId, 60_000);
      fastify.log.info(`[ROOMS] Scheduled auto-delete for public room ${roomId} (60s)`);
    }

    reply.send({ roomId, public: isPublic });
  });

  fastify.get("/rooms", async (request, reply) => {
    // support ?public=true to return only public rooms
    const publicQuery = (request.query as any)?.public;
    const publicOnly = typeof publicQuery !== 'undefined' ? (publicQuery === 'true' || publicQuery === true) : false;
    const rooms = getAllRooms();
    if (publicOnly) {
      const publicRooms = rooms.filter((r: any) => r.public === true);
      return reply.send(publicRooms);
    }
    reply.send(rooms);
  });

  fastify.get("/rooms/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const room = getRoom(id);
    if (!room) return reply.code(404).send({ error: "Room not found" });
    reply.send(room);
  });

  // Endpoint to register a finished match
  fastify.post('/matches', async (request: any, reply: any) => {
    const body = request.body as any;
    // expected body: { id?, roomId?, players: string[], winner?: string|null, score: { left:number, right:number }, endedAt?: number }
    if (!body || !Array.isArray(body.players) || typeof body.score === 'undefined') {
      return reply.code(400).send({ error: 'Invalid body' });
    }
    try {
      const matchId = saveMatch({ id: body.id, roomId: body.roomId, players: body.players, winner: body.winner ?? null, score: body.score, endedAt: body.endedAt });
      return reply.send({ matchId });
    } catch (err) {
      request.log.error('Failed saving match', err);
      return reply.code(500).send({ error: 'Failed to save match' });
    }
  });

  // Get matches for a player by player id
  fastify.get('/matches/player/:playerId', async (request: any, reply: any) => {
    const { playerId } = request.params as { playerId: string };
    if (!playerId) return reply.code(400).send({ error: 'playerId required' });
    try {
      const matches = getMatchesByPlayer(playerId);
      return reply.send(matches);
    } catch (err) {
      request.log.error('Failed fetching matches for player', playerId, err);
      return reply.code(500).send({ error: 'Failed fetching matches' });
    }
  });
}