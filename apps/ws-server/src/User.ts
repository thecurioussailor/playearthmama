import { WebSocket } from "ws";
import { prismaClient } from "@repo/db/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { WatchSessionManager } from "./WatchSessionManager";

dotenv.config();

export class User {
    private dbUserId?: string;
    private groupId?: string;
    private role?: string;
    constructor(private id: string, private ws: WebSocket){
        this.addListeners();
    };

    send(message: string){
        this.ws.send(message);
    };

    getUserId(){
        return this.id;
    }

    async verifyGroupMember(watchSessionId: string, dbUserId: string) {
        const watchSession = await prismaClient.watchSession.findUnique({
            where: {
                id: watchSessionId
            }
        });

        if(!watchSession){
            console.log("No Watch Session found");
            return false;
        }

        const groupId = watchSession.groupId;
        const participant = await prismaClient.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: dbUserId,
                    groupId
                }
            }
        })
        this.groupId = groupId;
        this.role = participant?.role;
        return !!participant;
    };

    private addListeners(){
        this.ws.on('message', (data: string) => {
            try {
                const parsedData = JSON.parse(data);
                switch(parsedData.type){
                    case 'join_session':
                        this.handleJoinSession(parsedData.payload);
                        break;
                    case 'leave_session':
                        this.handleLeaveSession(parsedData.payload);
                        break;
                    case 'play':
                        this.handlePlay(parsedData.payload);
                        break;
                    case 'pause':
                        this.handlePause(parsedData.payload);
                        break;
                    case 'seek':
                        this.handleSeek(parsedData.payload);
                        break;
                    default:
                        console.log("Unknown message type received");
                }
            } catch (error) {
                console.log("Failed to process user message: " + error)
            }
        })

        this.ws.on('close', () => {
            console.log(`User ${this.id} is disconnected.`);
            if(this.dbUserId){
                WatchSessionManager.getInstance().unsubscribeFromSession(this.dbUserId, this)
            }
        })
    }

    private async handleJoinSession(payload : { watchSessionId: string, token: string}){
        console.log("handling join session", payload);
        const { watchSessionId, token } = payload;

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {userId: string};
            this.dbUserId = decoded.userId;

            if(!this.dbUserId || !(await this.verifyGroupMember(watchSessionId, this.dbUserId))){
                this.ws.close();
                return;
            }

            WatchSessionManager.getInstance().addUserToWatchSession(watchSessionId, this);

            const playbackState = WatchSessionManager.getInstance().getPlaybackState(watchSessionId);
            this.send(JSON.stringify({
                type: playbackState.isPlaying ? "play" : "pause",
                timestamp: playbackState.timestamp
            }));

            console.log(`User ${this.dbUserId} is added to session ${watchSessionId}`)
        } catch (error) {
            console.log("Unable to Join the session", error);
            this.ws.close();
        }

    }

    private async handleLeaveSession(payload: { watchSessionId: string, token: string}){
        console.log("handling leave session");
        const { watchSessionId , token } = payload;

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            if(decoded.userId === this.dbUserId){
                WatchSessionManager.getInstance().unsubscribeFromSession(watchSessionId, this);
                console.log(`User ${this.dbUserId} left session ${watchSessionId}`);
            }
        } catch (error) {
            console.log("Error while leaving session", error);
        }
    }

    private async handlePlay(payload: { watchSessionId: string, timestamp: number}){
        console.log("handling play", payload);

        if(this.role !== "ADMIN"){
            console.log("Unauthorized play command");
            return
        }

        this.broadcastToSession(payload.watchSessionId, "play", payload.timestamp);
    }

    private async handlePause(payload: { watchSessionId: string, timestamp: number }){
        console.log("handling pause", payload);

        if (this.role !== "ADMIN"){
            console.log("Unauthorized pause command.");
            return;
        }

        this.broadcastToSession(payload.watchSessionId, "pause", payload.timestamp);
    }
    private async handleSeek(payload: { watchSessionId: string, timestamp: number }){
        console.log("Handling seek", payload);

        if (this.role !== "ADMIN") {
            console.log("Unauthorized seek command.");
            return;
        }

        this.broadcastToSession(payload.watchSessionId, "seek", payload.timestamp);
    }

    private broadcastToSession(watchSessionId: string, eventType: string, timestamp: number){
        WatchSessionManager.getInstance().publishMessage(watchSessionId, {
            type: eventType,
            timestamp,
            senderId: this.id
        })
    }
}