import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";

export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await prismaClient.user.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                username: true,
                email: true,
                profileImageUrl: true,
                bio: true,
                createdAt: true
            }
        })

        if(!user){
            res.status(404).json({
                message: "User not found"
            })
            return
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username, bio, profileImageUrl } = req.body;

    try{
        if(!username || !bio || !profileImageUrl){
            res.status(401).json({
                message: "Invalid Credentials"
            })
            return
        }
        const updatedUser = await prismaClient.user.update({
            where: {
                id: id
            },
            data: {
                username,
                bio, 
                profileImageUrl
            },
            select: {
                id: true,
                email: true,
                username: true,
                profileImageUrl: true,
                bio: true,
                createdAt: true
            }
        })

        res.json(updatedUser);
    }catch(error){
        res.status(500).json({
                message: "Internal Server Error"
        })
    }
}

export const getUserVideos = async (req: Request, res: Response) => {
    const { id } = req.params;
    try{
        const videos = await prismaClient.video.findMany({
            where: {
                userId: id
            },
            include: {
                user: true
            }
        })

        res.status(200).json(videos)
    }catch(error){
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}