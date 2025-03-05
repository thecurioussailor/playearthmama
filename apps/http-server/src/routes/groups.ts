import { Router } from "express";
import { addMember, createGroup, deleteGroup, getGroup, getGroupMembers, removeMember, updateGroup, updateMemberRole } from "../controllers/groupController";
import { authMiddleware } from "../middlewares/authMiddleware";

export const groupRoutes = Router();

groupRoutes.post('/', authMiddleware,createGroup);
groupRoutes.get('/:groupId', authMiddleware, getGroup);
groupRoutes.put('/:groupId', authMiddleware, updateGroup);
groupRoutes.delete('/:groupId', authMiddleware, deleteGroup);
groupRoutes.post('/:groupId/members', authMiddleware, addMember);
groupRoutes.delete('/:groupId/members/:userId', authMiddleware, removeMember);
groupRoutes.put('/:groupId/members/:userId/role', authMiddleware, updateMemberRole);
groupRoutes.get('/:groupId/members', authMiddleware, getGroupMembers);
