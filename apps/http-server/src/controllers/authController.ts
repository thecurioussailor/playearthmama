import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prismaClient } from "@repo/db/client"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req: Request, res: Response) => {
    try{
        console.log("entered register")
        console.log(req.body);
        const { email, username, password } = req.body;
     
        console.log(" credentials" ,email, username, password)
        if(!email || !username || !password){
            console.log("inside if")
             res.status(403).json({
                message: "Invalidation Error"
            })
            return
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prismaClient.user.create({
            data: {
                email,
                username,
                password: hashedPassword
            }
        })

        res.status(201).json({
            message: "User registered successfully"
        })
    }catch(error){
        res.status(500).json({
            message: "Internal Server Error",
            error
        })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if(!email || !password){
            res.status(400).json({
                message: "Invalid Credentials"
            })
            return
        }

        const user = await prismaClient.user.findUnique({
            where: {
                email
            }
        })

        if(!user){
            res.status(400).json({
                message: "Invalid Credentials"
            })
            return 
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if(!isValidPassword){
            res.status(401).json({
                message: "Invalid Credentials"
            })
            return
        }

        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET!);

        res.status(200).json({
            token
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}