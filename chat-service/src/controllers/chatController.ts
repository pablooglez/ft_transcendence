import { FastifyReply, FastifyRequest } from "fastify";
import * as chatService from "../services/chatService";
import { extractUserId } from "../utils/auth";
import * as conversationRepo from "../repositories/conversationRepository";
import * as blockRepo from "../repositories/blockRepository";
import * as websocketService from "../services/websocketService";
import { deleteFriendInvitationsByUser } from "../repositories/friendInvitationRepository";

export async function sendMessageController(req: FastifyRequest, reply: FastifyReply) {
    const { recipientId, content, messageType } = req.body as { 
        recipientId: number; 
        content: string; 
        messageType?: string 
    };

    try {
        const userId = extractUserId(req.headers);
        
        const result = await chatService.sendMessage(userId, recipientId, content, messageType);
        return reply.send(result);
    } catch (err: any) {
        if (err.message === 'User not authenticated') {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
        return reply.code(400).send({ error: err.message });
    }
}

export async function getConversationsController(req: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = extractUserId(req.headers);
        
        const result = chatService.getConversations(userId);
        return reply.send({ conversations: result });
    } catch (err: any) {
        if (err.message === 'User not authenticated') {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
        return reply.code(500).send({ error: err.message });
    }
}

export async function deleteUserDataController(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.params as { userId: string };
    const deletedUserId = parseInt(userId);
    
    try {
        // First, get all conversations for this user to notify affected users
        const conversations = conversationRepo.getConversationsForUser(deletedUserId);
        
        // Get all other users who have conversations with the deleted user
        const affectedUserIds = new Set<number>();
        conversations.forEach((conv: any) => {
            if (conv.participant1_id === deletedUserId) {
                affectedUserIds.add(conv.participant2_id);
            } else {
                affectedUserIds.add(conv.participant1_id);
            }
        });
        
        // Delete all conversations, messages (CASCADE), and blocks for the user
        const conversationsDeleted = conversationRepo.deleteUserConversations(deletedUserId);
        const blocksDeleted = blockRepo.deleteUserBlocks(deletedUserId);
        deleteFriendInvitationsByUser(deletedUserId);
        
        // Notify all affected users via WebSocket to refresh their conversations
        affectedUserIds.forEach(affectedUserId => {
            websocketService.notifyUserDeleted(affectedUserId, deletedUserId);
        });
        
        return reply.send({ 
            success: true,
            conversationsDeleted: conversationsDeleted.changes,
            blocksDeleted: blocksDeleted.changes,
            usersNotified: affectedUserIds.size
        });
    } catch (err: any) {
        return reply.code(500).send({ error: err.message });
    }
}

export async function getMessagesController(req: FastifyRequest, reply: FastifyReply) {
    const { userId: otherUserId } = req.params as { userId: string };
    const { limit } = req.query as { limit?: string };

    try {
        const userId = extractUserId(req.headers);
        
        const result = chatService.getMessages(
            parseInt(otherUserId), 
            userId, 
            limit ? parseInt(limit) : 50
        );
        return reply.send({ messages: result });
    } catch (err: any) {
        if (err.message === 'User not authenticated') {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
        return reply.code(500).send({ error: err.message });
    }
}

export async function blockUserController(req: FastifyRequest, reply: FastifyReply) {
    const { userId: blockedUserId } = req.params as { userId: string };

    try {
        const userId = extractUserId(req.headers);
        
        const result = chatService.blockUser(userId, parseInt(blockedUserId));
        return reply.send(result);
    } catch (err: any) {
        if (err.message === 'User not authenticated') {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
        return reply.code(400).send({ error: err.message });
    }
}

export async function unblockUserController(req: FastifyRequest, reply: FastifyReply) {
    const { userId: blockedUserId } = req.params as { userId: string };

    try {
        const userId = extractUserId(req.headers);
        
        const result = chatService.unblockUser(userId, parseInt(blockedUserId));
        return reply.send(result);
    } catch (err: any) {
        if (err.message === 'User not authenticated') {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
        return reply.code(400).send({ error: err.message });
    }
}

export async function getBlockedUsersController(req: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = extractUserId(req.headers);
        
        const result = chatService.getBlockedUsers(userId);
        return reply.send({ blockedUsers: result });
    } catch (err: any) {
        if (err.message === 'User not authenticated') {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
        return reply.code(500).send({ error: err.message });
    }
}