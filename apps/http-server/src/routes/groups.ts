import { Router } from "express";
import { addMember, createGroup, deleteGroup, getGroup, getGroupMembers, removeMember, updateGroup, updateMemberRole } from "../controllers/groupController";

export const groupRoutes = Router();

groupRoutes.post('/', createGroup);
groupRoutes.get('/:groupId', getGroup);
groupRoutes.put('/:groupId', updateGroup);
groupRoutes.delete('/:groupId', deleteGroup);
groupRoutes.post('/:groupId/members', addMember);
groupRoutes.delete('/:groupId/members/:userId', removeMember);
groupRoutes.put('/:groupId/members/:userId/role', updateMemberRole);
groupRoutes.get('/:id/members', getGroupMembers);
