/**
 * Schema for sending a game invitation
 */
export const SendGameInvitationSchema = {
    type: 'object',
    properties: {
        toUserId: {
            type: 'number',
            minimum: 1,
            description: 'ID of the user to invite'
        },
        gameType: {
            type: 'string',
            description: 'Type of game (classic, custom, etc.)'
        }
    },
    required: ['toUserId']
} as const;

export interface SendGameInvitationType {
    toUserId: number;
    gameType?: string;
}

/**
 * Schema for game invitation ID parameter
 */
export const GameInvitationIdParamSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            pattern: '^[0-9]+$',
            description: 'Game invitation ID'
        }
    },
    required: ['id']
} as const;

export interface GameInvitationIdParamType {
    id: string;
}

/**
 * Response schemas
 */
export const GameInvitationResponseSchema = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        fromUserId: { type: 'number' },
        toUserId: { type: 'number' },
        gameType: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string' }
    }
} as const;

export const GameInvitationsListResponseSchema = {
    type: 'object',
    properties: {
        invitations: {
            type: 'array',
            items: GameInvitationResponseSchema
        }
    }
} as const;

export const GameInvitationSuccessResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        invitation: GameInvitationResponseSchema
    },
    required: ['success']
} as const;

export const GameInvitationErrorResponseSchema = {
    type: 'object',
    properties: {
        error: { type: 'string' }
    },
    required: ['error']
} as const;
