import { createClient, RedisClientType } from "redis";
import { User } from "./User";

export class WatchSessionManager {
    private static instance: WatchSessionManager;
    private sessions: Map<string, Set<User>> = new Map();
    private playbackState: Map<string, { isPlaying: boolean, timestamp: number }> = new Map();
    private subscriber: RedisClientType;
    private publisher: RedisClientType;

    private constructor() {
        this.subscriber = createClient();
        this.subscriber.connect();

        this.publisher = createClient();
        this.publisher.connect();
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new WatchSessionManager();
        }

        return this.instance;
    }

    public addUserToWatchSession(watchSessionId: string, user: User){
        if(!this.sessions.get(watchSessionId)){
            this.sessions.set(watchSessionId, new Set());
            this.subscribeToRedis(watchSessionId);
        }

        this.sessions.get(watchSessionId)?.add(user);
        console.log(`User ${user.getUserId()} is added to Session ${watchSessionId}`);
    }

    public subscribeToRedis(watchSessionId: string){
        this.subscriber.subscribe(watchSessionId, (data) => {
            const parsedData = JSON.parse(data.toString());
            const sessionUsers = this.sessions.get(watchSessionId);

            const eventData = {
                type: parsedData.type,
                payload: parsedData.timestamp,
                metadata: { timestamp: new Date() }
            };

            if(sessionUsers){
                for(const user of sessionUsers){
                    if(user.getUserId() !== parsedData.senderId){
                        user.send(JSON.stringify(eventData));
                    }
                }
            }
        })
    }

    public unsubscribeFromSession(watchSessionId: string, user: User){
        const sessionUsers = this.sessions.get(watchSessionId);
        if(sessionUsers){
            sessionUsers.delete(user);
            console.log(`User ${user.getUserId()} left session ${watchSessionId}`);
            if(sessionUsers.size === 0){
                this.sessions.delete(watchSessionId);
                this.playbackState.delete(watchSessionId);
                console.log(`Session ${watchSessionId} is now empty and removed.`);
            }
        }
    }

    public publishMessage(watchSessionId: string, message: { type: string, timestamp: number, senderId: string}){
        this.publisher.publish(watchSessionId, JSON.stringify(message));
        if (message.type === "play" || message.type === "pause" || message.type === "seek") {
            this.playbackState.set(watchSessionId, { isPlaying: !(message.type === "pause"), timestamp: message.timestamp });
        }
    }

    public getPlaybackState(watchSessionId: string) {
        return this.playbackState.get(watchSessionId) || { isPlaying: false, timestamp: 0 };
    }
}