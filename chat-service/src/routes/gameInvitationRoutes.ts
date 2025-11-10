import { FastifyInstance } from "fastify";
import * as gameInvitationController from "../controllers/gameInvitationController";
import {
    SendGameInvitationSchema,
    GameInvitationIdParamSchema,
    GameInvitationsListResponseSchema,
    GameInvitationSuccessResponseSchema,
    GameInvitationErrorResponseSchema
} from "../schemas";

export async function gameInvitationRoutes(fastify: FastifyInstance) {
    // POST /game-invitations/send - Send game invitation
    fastify.post('/conversations/game-invitations/send', {
        schema: {
            body: SendGameInvitationSchema,
            response: {
                200: GameInvitationSuccessResponseSchema,
                400: GameInvitationErrorResponseSchema
            }
        }
    }, gameInvitationController.sendGameInvitationController);
    
    // GET /game-invitations/received - Get pending invitations received
    fastify.get('/conversations/game-invitations/received', {
        schema: {
            response: {
                200: GameInvitationsListResponseSchema,
                400: GameInvitationErrorResponseSchema
            }
        }
    }, gameInvitationController.getPendingInvitationsController);
    
    // GET /game-invitations/sent - Get sent invitations
    fastify.get('/conversations/game-invitations/sent', {
        schema: {
            response: {
                200: GameInvitationsListResponseSchema,
                400: GameInvitationErrorResponseSchema
            }
        }
    }, gameInvitationController.getSentInvitationsController);
    
    // POST /game-invitations/:id/accept - Accept game invitation
    fastify.post('/conversations/game-invitations/:id/accept', {
        schema: {
            params: GameInvitationIdParamSchema,
            response: {
                200: GameInvitationSuccessResponseSchema,
                400: GameInvitationErrorResponseSchema
            }
        }
    }, gameInvitationController.acceptGameInvitationController);
    
    // POST /game-invitations/:id/reject - Reject game invitation
    fastify.post('/conversations/game-invitations/:id/reject', {
        schema: {
            params: GameInvitationIdParamSchema,
            response: {
                200: GameInvitationSuccessResponseSchema,
                400: GameInvitationErrorResponseSchema
            }
        }
    }, gameInvitationController.rejectGameInvitationController);
}
