import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const header = req.headers.authorization;
        const token = header?.split(' ')[1];

        if(!token){
            res.status(401).json({
                message: "Unauthorized"
            })
            return
        }

        const decoded = jwt.verify(token, JWT_SECRET!) as {userId: string};
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({
            message: "Invalid Token"
        })
    }
}