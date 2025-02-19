import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express"

export const subscribeToUser = async(req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const subscriberId = req.userId;

        if(userId === subscriberId){
            res.json({
                message: "You cannot subscribe to yourself"
            })
            return
        }

        const creator = await prismaClient.user.findUnique({
            where: {
                id: userId
            }
        })
        if(!creator){
            res.status(404).json({
                message: "Creator not found"
            })
            return
        }

        const subscription = await prismaClient.subscription.create({
            data: {
                subscriberId,
                creatorId: userId
            }
        });

        res.status(201).json(subscription)
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error" + error
        })
    }
}
export const unsubscribeFromUser = async(req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const subscriberId = req.userId;

        await prismaClient.subscription.delete({
            where: {
                subscriberId_creatorId: {
                    subscriberId,
                    creatorId: userId
                }
            }
        });

        res.status(204).end();
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
export const getSubscriptions = async(req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const subscriptions = await prismaClient.subscription.findMany({
            where: {
                subscriberId: userId
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        profileImageUrl: true
                    }
                }
            }
        });

        res.json(subscriptions)
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
export const getSubscribers = async(req: Request, res: Response) => {
    try {
        const userId = req.userId;

        const subscribers = await prismaClient.subscription.findMany({
            where: {
                creatorId: userId
            },
            include: {
                subscriber: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        profileImageUrl: true
                    }
                }
            }
        });

        res.json(subscribers)
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
} 

