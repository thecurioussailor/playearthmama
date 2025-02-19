import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getSubscribers, getSubscriptions, subscribeToUser, unsubscribeFromUser } from "../controllers/subscriptionController";

export const subscriptionRoutes = Router();

subscriptionRoutes.post('/:userId', authMiddleware, subscribeToUser);
subscriptionRoutes.delete('/:userId', authMiddleware, unsubscribeFromUser);
subscriptionRoutes.get('/subscriptions', authMiddleware, getSubscriptions);
subscriptionRoutes.get('/subscribers', authMiddleware, getSubscribers);