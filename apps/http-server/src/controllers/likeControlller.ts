import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";

export const likeVideo = async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;

        const existingLike = await prismaClient.like.findUnique({
            where: {
                userId_videoId: {
                    userId,
                    videoId
                }
            }
        })

        if(existingLike){
            res.status(400).json({
                message: "You have already liked this video"
            });
            return
        }

        const like = await prismaClient.like.create({
            data: {
                videoId,
                userId
            }
        }) 

        await prismaClient.video.update({
            where: {
                id: videoId
            },
            data: {
                likeCount: {
                    increment: 1
                }
            }
        })

        res.status(201).json(like);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const unlikeVideo = async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;

        const like = await prismaClient.like.delete({
            where: {
                userId_videoId: {
                    userId,
                    videoId
                }
            }
        })

        await prismaClient.video.update({
            where: {
                id: videoId
            },
            data: {
                likeCount: {
                    decrement: 1
                }
            }
        })

        res.status(204).end();
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const getLikeStatus = async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;

        const like = await prismaClient.like.findUnique({
            where: {
                userId_videoId: {
                    userId,
                    videoId
                }
            }
        })

        res.json({
            isLiked: !!like
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
