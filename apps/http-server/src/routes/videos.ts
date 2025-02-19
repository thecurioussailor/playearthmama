import { Router } from "express";
import { createVideo,  deleteVideoById,  getAllVideos, getPresignedUrl, getVideoUrlById, updateVideoMetadataById } from "../controllers/videoController";
import { authMiddleware } from "../middlewares/authMiddleware";

export const videosRouter = Router();

videosRouter.post('/presigned-url', authMiddleware, getPresignedUrl);
videosRouter.post('/', authMiddleware, createVideo);
videosRouter.get('/', getAllVideos);
videosRouter.get('/:videoId', getVideoUrlById);
videosRouter.put('/:videoId', updateVideoMetadataById);
videosRouter.delete('/:videoId', deleteVideoById);