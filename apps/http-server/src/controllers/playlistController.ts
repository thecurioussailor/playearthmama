import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express"

export const createPlaylist = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const userId = req.userId;

        const playlist = await prismaClient.playlist.create({
            data: {
                name,
                description,
                userId
            }
        })

        res.status(201).json(playlist);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const getPlaylist = async (req: Request, res: Response) => {
    try {
        const { playlistId } = req.params;
        const playlist = await prismaClient.playlist.findUnique({
            where: {
                id: playlistId
            },
            include: {
                videos: {
                    include: {
                        video: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        })

        if(!playlist){
            res.status(404).json({
                message: "Playlist not found"
            })
        }

        res.json(playlist);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const updatePlaylist = async (req: Request, res: Response) => {
    try {
        const { playlistId } = req.params;
        const userId = req.userId;
        const { name, description} = req.body;

        const playlist = await prismaClient.playlist.update({
            where: {
                id: playlistId,
                userId
            },
            data: {
                name,
                description
            }
        });

        res.json(playlist);

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const deletePlaylist = async (req: Request, res: Response) => {
    try {
        const { playlistId } = req.params;
        const userId = req.userId;

        await prismaClient.playlist.delete({
            where: {
                id: playlistId,
                userId
            }
        })

        res.status(204).end();
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const addVideoToPlaylist = async (req: Request, res: Response) => {
    try {
        const { playlistId } = req.params;
        const { videoId } = req.body;

        const userId = req.userId;

        const playlist = await prismaClient.playlist.findUnique({
            where: {
                id: playlistId,
                userId
            },
            include: {
                videos: true
            }
        });

        if(!playlist){
            res.status(404).json({
                message: "Playlist not found"
            })
            return
        }

        const plalistVideo = await prismaClient.playlistVideo.create({
            data: {
                playlistId: playlistId,
                videoId,
                order: playlist.videos.length
            }
        })

        res.status(201).json(plalistVideo);
    }catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const removeVideoFromPlaylist = async (req: Request, res: Response) => {
    try {
        const { playlistId, videoId } = req.params;
        const userId = req.userId;

        await prismaClient.playlistVideo.delete({
            where: {
                playlistId_videoId: {
                    playlistId: playlistId,
                    videoId
                },
                playlist: {
                    userId
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




