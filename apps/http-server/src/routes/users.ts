import { Router } from "express";
import { getUserById, getUserVideos, updateUser } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

export const usersRouter = Router();

usersRouter.get('/:id', authMiddleware, getUserById);
usersRouter.put('/:id', authMiddleware, updateUser);
usersRouter.get('/:id/videos', getUserVideos);