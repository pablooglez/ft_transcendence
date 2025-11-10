/**
 * Schema for notification
 */
export const NotificationSchema = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        type: {
            type: 'string',
            description: 'Type of notification (message, friend_request, game_invitation, etc.)'
        },
        content: { type: 'string' },
        read: { type: 'boolean' },
        createdAt: { type: 'string' },
        relatedUserId: { type: 'number' },
        relatedEntityId: { type: 'number' }
    },
    required: ['id', 'userId', 'type', 'content', 'read', 'createdAt']
} as const;

export interface NotificationType {
    id: number;
    userId: number;
    type: string;
    content: string;
    read: boolean;
    createdAt: string;
    relatedUserId?: number;
    relatedEntityId?: number;
}

/**
 * Schema for sending a notification
 */
export const SendNotificationSchema = {
    type: 'object',
    properties: {
        content: {
            type: 'string',
            minLength: 1,
            description: 'Notification content'
        },
        message_type: {
            type: 'string',
            description: 'Type of notification message'
        },
        title: {
            type: 'string',
            description: 'Notification title'
        }
    },
    required: ['content']
} as const;

export interface SendNotificationType {
    content: string;
    message_type?: string;
    title?: string | null;
}

/**
 * Schema for notification ID parameter
 */
export const NotificationIdParamSchema = {
    type: 'object',
    properties: {
        notId: {
            type: 'string',
            pattern: '^[0-9]+$',
            description: 'Notification ID'
        }
    },
    required: ['notId']
} as const;

export interface NotificationIdParamType {
    notId: string;
}

/**
 * Schema for update notifications body
 */
export const UpdateNotificationsBodySchema = {
    type: 'object',
    properties: {
        userId: {
            type: 'number',
            minimum: 1,
            description: 'User ID'
        }
    },
    required: ['userId']
} as const;

export interface UpdateNotificationsBodyType {
    userId: number;
}

/**
 * Response schemas
 */
export const NotificationsListResponseSchema = {
    type: 'object',
    properties: {
        notifications: {
            type: 'array',
            items: NotificationSchema
        }
    }
} as const;

export const NotificationSuccessResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
    },
    required: ['success']
} as const;

export const NotificationErrorResponseSchema = {
    type: 'object',
    properties: {
        error: { type: 'string' }
    },
    required: ['error']
} as const;
