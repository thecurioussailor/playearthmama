import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylist, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlistController";

export const playlistRoutes = Router();

playlistRoutes.post('/', authMiddleware, createPlaylist);
playlistRoutes.get('/:playlistId', authMiddleware, getPlaylist);
playlistRoutes.put('/:playlistId', authMiddleware, updatePlaylist);
playlistRoutes.delete('/:playlistId', authMiddleware, deletePlaylist);
playlistRoutes.post('/:playlistId/videos', authMiddleware, addVideoToPlaylist);
playlistRoutes.delete('/:playlistId/videos/:videoId', authMiddleware, removeVideoFromPlaylist);