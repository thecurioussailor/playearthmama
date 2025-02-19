import { Request, Response } from "express";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import dotenv from "dotenv";
import { prismaClient } from "@repo/db/client";
dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const MAX_SINGLE_PART_SIZE = 20 * 1024 * 1024;

export const getPresignedUrl = async (req: Request, res: Response) => {
    const { fileType, fileName } = req.body;

    const userId = req.userId;

    if(!fileName || !fileType || !userId){
        res.status(400).json({
            message: "Invalid credentials"
        })
        return
    }

    try{
        const fileExtension = fileName.split('.').pop();
        const timestamp = Date.now();
        const uniqueId = crypto.randomUUID();

        const s3Key = `videos/${userId}/${timestamp}-${uniqueId}.${fileExtension}`;

        const putObjectParams = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            ContentType: fileType
        }

        const command = new PutObjectCommand(putObjectParams);

        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600});

        res.json({
            presignedUrl,
            s3Key
        });
    }catch(error){
        res.status(500).json({
            message: "Unable to generate presigned URL"
        });
    }
}

export const createVideo = async (req: Request, res: Response) => {
    const { title, description, key, fileSize } = req.body;
    const userId = req.userId;

    if(!key){
        res.status(400).json({
            message: "Video key is required"
        });
        return
    }

    try {
        const video = await prismaClient.video.create({
            data: {
                title,
                description,
                url: key,
                userId,
                duration: 0
            }
        })

        res.status(201).json(video);
    } catch (error) {
        res.status(500).json({
            message: "Unable to create video"
        })
    }
    
}

export const getAllVideos = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        const videos = await prismaClient.video.findMany({
            where: {
                userId
            }
        });

        res.status(200).json(videos)
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const getVideoUrlById = async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const userId = req.userId;

    try {
        const video = await prismaClient.video.findUnique({
            where: {
                id: videoId,
                userId
            }
        });

        if(!video){
            res.status(404).json({
                message: "Video not found"
            })
            return
        }

        const getObjectParams = {
            Bucket: BUCKET_NAME,
            Key: video.url
        }

        const command = new GetObjectCommand(getObjectParams);
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600});
        res.json({presignedUrl})
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error" + error
        })
    }
}
export const updateVideoMetadataById = async(req: Request, res: Response) => {
    try {
        const { videoId } = req.params;
        const { title, description } = req.body;
        const userId = req.userId;

        const existingVideo = await prismaClient.video.findFirst({
            where: {
                id: videoId,
                userId
            }
        })

        if(!existingVideo){
            res.status(404).json({
                message: "Video is not found or you do not have permisstion to update it"
            })
            return
        }



        const updatedVideo = await prismaClient.video.update({
            where: {
                id: videoId,
                userId
            },
            data: {
                title,
                description
            }
        })
        res.json(updatedVideo)
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
export const deleteVideoById = async(req: Request, res: Response) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;

        const existingVideo = await prismaClient.video.findFirst({
            where: {
                id: videoId,
                userId
            }
        })

        if(!existingVideo){
            res.status(404).json({
                message: "Video not found or you do not have permission to delete it"
            })
            return
        }

        const deleteParams = {
            Bucket: BUCKET_NAME,
            Key: existingVideo.url
        }

        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3Client.send(deleteCommand);

        await prismaClient.video.delete({
            where: {
                id: videoId
            }
        })

        res.status(204).end();

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
