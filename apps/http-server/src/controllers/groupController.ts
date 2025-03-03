import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";

export const createGroup = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const ownerId = req.userId;

        const group = await prismaClient.group.create({
            data: {
                name,
                description,
                ownerId,
                members: {
                    create: {
                        userId: ownerId,
                        role: "OWNER"
                    }
                }
            },
            include: {
                members: {
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

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


export const getGroup = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const userId = req.userId;

        const group = await prismaClient.group.findUnique({
            where: {
                id: groupId
            },
            include: {
                members: {
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

        if(!group){
            res.status(404).json({
                message: "Group not found"
            })
            return
        }

        const isMember = group.members.some(member => member.userId === userId);

        if(!isMember){
            res.status(404).json({
                message: "You are not a member of this group"
            });
            return
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const updateGroup = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const { name, description} = req.body;
        const userId = req.userId;

        const group = await prismaClient.group.findUnique({
            where: {
                id: groupId
            },
            include: {
                members: true
            }
        });

        if(!group){
            res.status(404).json({
                message: "Group not found"
            });
            return
        };

        const userRole = group.members.find(member => member.userId === userId)?.role;

        if( userRole !== "OWNER" && userRole !== "ADMIN"){
            res.status(403).json({
                message: "You do not have permission to update this group"
            });
        };

        const updatedGroup = await prismaClient.group.update({
            where: {
                id: groupId
            },
            data: {
                name,
                description
            }
        });

        res.json(updateGroup);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const deleteGroup = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const userId = req.userId;

        const group = await prismaClient.group.findUnique({
            where: {
                id: groupId
            },
            include: {
                members: true
            }
        });

        if(!group){
            res.status(404).json({
                message: "Group not found"
            });
            return;
        }

        const userRole = group.members.find(member => member.userId === userId)?.role;

        if(userRole !== "OWNER"){
            res.status(403).json({
                message: "Only the group owner can delete the group"
            });
        };

        await prismaClient.group.delete({
            where: {
                id: groupId
            }
        });

        res.status(204).end();

    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


export const addMember = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const currentUserId = req.userId;

        const group = await prismaClient.group.findUnique({
            where: {
                id: groupId
            },
            include: {
                members: true
            }
        });

        if(!group){
            res.status(404).json({
                message: "Group not found"
            });
            return
        };

        const currentUserRole = group.members.find(member => member.userId === currentUserId)?.role;

        if(currentUserRole !== "OWNER" && currentUserRole !== "ADMIN"){
            res.status(403).json({
                message: "You do not have permission to add members to this group"
            })
            return
        };

        const newMember = await prismaClient.groupMember.create({
            data: {
                userId,
                groupId,
                role: "MEMBER"
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

        res.status(500).json({
            message: "Unable to Add member to group"
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


export const removeMember = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


export const updateMemberRole = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


export const getGroupMembers = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}