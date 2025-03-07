import { WebSocket } from "ws";
import { User } from "./User";
import crypto from "crypto"
export class UserManager {
    private static instance: UserManager;
    private users: Map<string, User> = new Map();

    private constructor(){};

    public static getInstance(){
        if(!this.instance){
            this.instance = new UserManager();
        }

        return this.instance;
    };

    addUser(ws: WebSocket){
        const id = crypto.randomUUID();
        const user = new User(id, ws);
        this.users.set(id, user);

        console.log(`User is added with ID: ${id}`);
        return id;
    }

    public getUser(userId: string){
        return this.users.get(userId);
    }

    public removeUser(userId: string){
        if(this.users.has(userId)){
            this.users.delete(userId);
            console.log(`User with ID ${userId} removed`);
        }
    }
}