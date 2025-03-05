import { Router } from "express";
import { createWatchSession, deleteWatchSession, getWatchSession } from "../controllers/watchSessionController";

export const watchSessionRouter = Router();

watchSessionRouter.post('/', createWatchSession);
watchSessionRouter.get('/:id', getWatchSession);
watchSessionRouter.delete('/:id', deleteWatchSession);


