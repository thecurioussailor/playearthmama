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
        console.log(error);
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
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error is this"
        })
    }
}

export const updateGroup = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const { name, description } = req.body;
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
            return
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

        res.json(updatedGroup);
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
            return
        };

        await prismaClient.$transaction([
            prismaClient.groupMember.deleteMany({
                where: {
                    groupId: groupId
                }
            }),
            prismaClient.group.delete({
                where: {
                    id: groupId
                }
            })
        ]);

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
        console.log("Inside addMember")
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
        console.log("gorup", group);

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

        console.log(newMember);
        res.status(201).json(newMember);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


export const removeMember = async (req: Request, res: Response) => {
    try {
        const { groupId, userId } = req.params;
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
            return;
        }

        const currentUserRole = group.members.find(member => member.userId === currentUserId)?.role;
        const memberToRemove = group.members.find(member => member.userId === userId);

        if(!memberToRemove){
            res.status(404).json({
                message: "Member not found in the group"
            });
            return
        };

        if(currentUserRole !== "OWNER" && currentUserRole !== "ADMIN" && currentUserId !== userId){
            res.status(403).json({
                message: "You do not have permission to remove this member"
            });
            return
        };

        if(memberToRemove.role === "OWNER"){
            res.status(403).json({
                message: " The owner cannot be removed from the group"
            })
            return
        }

        await prismaClient.groupMember.delete({
            where: {
                userId_groupId: {
                    userId,
                    groupId
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


export const updateMemberRole = async (req: Request, res: Response) => {
    try {
        const { groupId, userId } = req.params;
        const { role } = req.body;

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
        const memberToUpdate = group.members.find(member => member.userId === userId);

        if(!memberToUpdate){
            res.status(404).json({
                message: "Member not found in group"
            });
            return;
        };

        if (currentUserRole !== "OWNER" && currentUserRole !== "ADMIN") {
            res.status(403).json({ error: 'You do not have permission to update member roles' });
            return
        }
      
        if (memberToUpdate.role === "OWNER") {
            res.status(403).json({ error: 'The owner\'s role cannot be changed' });
            return
        }

        const updatedMember = await prismaClient.groupMember.update({
            where: {
                userId_groupId: {
                    userId,
                    groupId
                }
            },
            data: {
                role
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
        })
        res.json(updatedMember);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


export const getGroupMembers = async (req: Request, res: Response) => {
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
        });

        if(!group){
            res.status(404).json({
                message: "Group not found"
            })
            return
        };

        const isMember = group.members.some(member => member.userId === userId);
        if(!isMember){
            res.status(403).json({
                message: "You are not member of this group"
            })
            return
        }

        res.json(group.members);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}