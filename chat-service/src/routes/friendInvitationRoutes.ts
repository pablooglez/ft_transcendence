import { FastifyInstance } from "fastify";
import { inviteFriendController,
         acceptFriendInvitationController,
         rejectFriendInvitationController,
        } from "../controllers/friendInvitationController";
import {
    FriendInvitationParamSchema,
    FriendInvitationSuccessSchema
} from "../schemas";

export async function friendInvitationRoutes(fastify: FastifyInstance) {

    fastify.post('/conversations/:otherUserId/invite-friend', {
        schema: {
            params: FriendInvitationParamSchema,
            response: {
                200: FriendInvitationSuccessSchema
            }
        }
    }, inviteFriendController);

    // POST /conversations/:otherUserId/accept-friend - Accept friend invitation
    fastify.post('/conversations/:otherUserId/accept-friend', {
        schema: {
            params: FriendInvitationParamSchema,
            response: {
                200: FriendInvitationSuccessSchema
            }
        }
    }, acceptFriendInvitationController);
    
    // POST /conversations/:otherUserId/reject-friend - Reject friend invitation
    fastify.post('/conversations/:otherUserId/reject-friend', {
        schema: {
            params: FriendInvitationParamSchema,
            response: {
                200: FriendInvitationSuccessSchema
            }
        }
    }, rejectFriendInvitationController);
}
