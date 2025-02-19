import { Router } from "express";
import { authRouter } from "./auth";
import { usersRouter } from "./users";
import { videosRouter } from "./videos";
import { likeRoutes } from "./likes";
import { commentRoutes } from "./comments";
import { subscriptionRoutes } from "./subscriptions";
import { playlistRoutes } from "./playlists";

export const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/videos', videosRouter);
router.use('/comments', commentRoutes);
router.use('/likes', likeRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/playlists', playlistRoutes);
// router.use('/groups', );
// router.use('/watch-sessions', );