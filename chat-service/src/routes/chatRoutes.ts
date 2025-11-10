import { FastifyInstance } from "fastify";
import * as chatController from "../controllers/chatController";
import {
    SendMessageSchema,
    UserIdParamSchema,
    GetMessagesQuerySchema,
    MessagesResponseSchema,
    ConversationsResponseSchema,
    BlockedUsersResponseSchema,
    SuccessResponseSchema,
    ErrorResponseSchema,
    DeleteUserDataResponseSchema
} from "../schemas";

export async function chatRoutes(fastify: FastifyInstance) {
    // POST /conversations/:userId/messages - Send message
    fastify.post('/conversations/:userId/messages', {
        schema: {
            body: SendMessageSchema,
            params: UserIdParamSchema,
            response: {
                200: SuccessResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema
            }
        }
    }, chatController.sendMessageController);
    
    // GET /conversations - Get all conversations from the user
    fastify.get('/conversations', {
        schema: {
            response: {
                200: ConversationsResponseSchema,
                401: ErrorResponseSchema,
                500: ErrorResponseSchema
            }
        }
    }, chatController.getConversationsController);
    
    // GET /conversations/:userId/messages - Retrieve messages from a conversation
    fastify.get('/conversations/:userId/messages', {
        schema: {
            params: UserIdParamSchema,
            querystring: GetMessagesQuerySchema,
            response: {
                200: MessagesResponseSchema,
                401: ErrorResponseSchema,
                500: ErrorResponseSchema
            }
        }
    }, chatController.getMessagesController);
    
    // POST /conversations/:userId/block - Block user
    fastify.post('/conversations/:userId/block', {
        schema: {
            params: UserIdParamSchema,
            response: {
                200: SuccessResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema
            }
        }
    }, chatController.blockUserController);
    
    // DELETE /conversations/:userId/block - Unlock user
    fastify.delete('/conversations/:userId/block', {
        schema: {
            params: UserIdParamSchema,
            response: {
                200: SuccessResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema
            }
        }
    }, chatController.unblockUserController);
    
    // GET /blocked - Get list of blocked users
    fastify.get('/blocked', {
        schema: {
            response: {
                200: BlockedUsersResponseSchema,
                401: ErrorResponseSchema,
                500: ErrorResponseSchema
            }
        }
    }, chatController.getBlockedUsersController);
    
    // DELETE /users/:userId/data - Delete all chat data for a user (called when user is deleted)
    fastify.delete('/users/:userId/data', {
        schema: {
            params: UserIdParamSchema,
            response: {
                200: DeleteUserDataResponseSchema,
                500: ErrorResponseSchema
            }
        }
    }, chatController.deleteUserDataController);
}
