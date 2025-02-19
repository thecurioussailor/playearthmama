import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getLikeStatus, likeVideo, unlikeVideo } from "../controllers/likeControlller";

export const likeRoutes = Router();

likeRoutes.post('/:videoId', authMiddleware, likeVideo);
likeRoutes.delete('/:videoId', authMiddleware, unlikeVideo);
likeRoutes.get('/:videoId', authMiddleware, getLikeStatus);
