import { Router , Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { getChats, getUser } from "../controller/db";

export const chatsRouter = Router();

chatsRouter.get('/' , async (req : AuthRequest , res : Response) => {
    try{
        const userId = req.userId as string;
        const user = await getUser(userId);

        if(!user || user === null){
            res.status(401).json("Unauthorized!!");
            return;
        }

        const chats = await getChats(user.userId);
        res.json({ chats : chats });

    }catch(err){
        console.log("An error occured while fetching all the chats : " , err);
        res.status(500).json({ error : "Internal server error!!" });
    }
});