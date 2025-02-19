import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";

export const createComment = async (req: Request, res: Response) => {
    try {
        const { videoId, content, parentId } = req.body;
        const userId = req.userId;

        const comment = await prismaClient.comment.create({
            data: {
                content,
                userId,
                videoId,
                parentId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profileImageUrl: true
                    }
                }
            }
        });

        res.status(201).json(comment);

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const getComments = async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;

        const comments = await prismaClient.comment.findMany({
            where: {
                videoId,
                parentId: null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profileImageUrl: true
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profileImageUrl: true
                            }
                        }
                    }
                }
            }
        })

        res.json(comments);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const updateComment = async (req: Request, res: Response) => {
    try {
       const { commentId } = req.params;
       const { content } = req.body;
       const userId = req.userId;

       const comment = await prismaClient.comment.update({
        where: {
            id: commentId,
            userId
        },
        data: {
            content
        },
        include: {
            user: true
        }
       })

       res.json({
        message: "Your comment got updated"
       })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;

        await prismaClient.comment.delete({
            where: {
                id: commentId,
                userId
            }
        })

        res.status(204).json({
            message: "Your comment has been deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}