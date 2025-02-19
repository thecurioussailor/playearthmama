import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createComment, deleteComment, getComments, updateComment } from "../controllers/commentController";

export const commentRoutes = Router();

commentRoutes.post('/', authMiddleware, createComment);
commentRoutes.get('/video/:videoId', authMiddleware, getComments);
commentRoutes.put('/:commentId', authMiddleware, updateComment);
commentRoutes.delete('/:commentId', authMiddleware, deleteComment)