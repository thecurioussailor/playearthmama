import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";

export const createWatchSession = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { groupId, videoId } = req.body;

        const watchSession = await prismaClient.watchSession.create({
            data: {
                groupId,
                videoId
            }
        })

        res.status(201).json({
            message: "Session Created",
            watchSession
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
export const getWatchSession = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const watchSession = await prismaClient.watchSession.findUnique({
            where: {
                id
            },
            include: {
                video: true,
                group: true
            }
        });

        if(!watchSession){
            res.status(404).json({
                message: "Session not found!"
            });
            return
        }
        res.status(200).json(watchSession);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
export const deleteWatchSession = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { currentTime } = req.body;

        const watchSession = await prismaClient.watchSession.findUnique({
            where: {
                id
            }
        })

        if(!watchSession){
            res.status(404).json({
                message: "Watch Session not found"
            })
            return
        }

        await prismaClient.watchSession.delete({
            where: {
                id
            }
        })

        res.status(204).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const changeSessionVideo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { videoId } = req.body;

        const session = await prismaClient.watchSession.update({
            where: { id },
            data: { videoId, currentTime: 0 }, // Reset time
          });
      
        res.status(200).json({ message: 'Video changed successfully', session });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}