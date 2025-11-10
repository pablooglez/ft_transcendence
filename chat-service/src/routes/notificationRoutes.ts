import { FastifyInstance } from "fastify";
import { sendNotificationController,
         getNotificationsController,
         updateNotificationsController,
         getSpecificNotificationController,
         updateOneNotificationController,
         deleteOneNotificationController,
        } from "../controllers/notificationsController";
import {
    SendNotificationSchema,
    NotificationIdParamSchema,
    UpdateNotificationsBodySchema,
    NotificationsListResponseSchema,
    NotificationSuccessResponseSchema,
    NotificationErrorResponseSchema,
    NotificationSchema,
    UserIdParamSchema
} from "../schemas";

export async function notificationsRoutes(fastify: FastifyInstance) {
    // POST /conversations/:userId/notify - Send notification
    fastify.post('/conversations/:userId/notify', {
        schema: {
            params: UserIdParamSchema,
            body: SendNotificationSchema,
            response: {
                201: NotificationSuccessResponseSchema,
                200: NotificationErrorResponseSchema
            }
        }
    }, sendNotificationController);
    
    // GET /conversations/notifications - Get all notifications from the user
    fastify.get('/conversations/notifications', {
        schema: {
            response: {
                200: NotificationsListResponseSchema
            }
        }
    }, getNotificationsController);

    fastify.get('/conversations/:notId/notification', {
        schema: {
            params: NotificationIdParamSchema,
            response: {
                200: NotificationSchema
            }
        }
    }, getSpecificNotificationController);

    // GET /conversations - Get all notifications from the user
    fastify.get('/conversations/notifications/update', {
        schema: {
            body: UpdateNotificationsBodySchema,
            response: {
                200: NotificationSuccessResponseSchema
            }
        }
    }, updateNotificationsController);

    fastify.get('/conversations/:notId/read', {
        schema: {
            params: NotificationIdParamSchema,
            response: {
                200: NotificationSuccessResponseSchema
            }
        }
    }, updateOneNotificationController);

    fastify.delete('/conversations/:notId/notifyDelete', {
        schema: {
            params: NotificationIdParamSchema,
            response: {
                200: NotificationSuccessResponseSchema
            }
        }
    }, deleteOneNotificationController);
}
