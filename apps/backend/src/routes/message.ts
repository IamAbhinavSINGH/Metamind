import { Router , Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { deleteMessage, getUser } from "../controller/db";

export const messageRouter = Router();


messageRouter.delete('/' , async (req : AuthRequest , res : Response) => {
    try{
        const userId = req.userId as string;
        const user = await getUser(userId);

        if(!user || user === null){
            res.status(401).json({ error : "Unauthorized!!" });
            return;
        }

       const messageId = req.query.messageId as string;
       const chatId = req.query.chatId as string;

       if(!messageId || !chatId){
            res.status(401).json({ error : "Invalid inputs!" });
            return;
       }

        const { success , error } = await deleteMessage(messageId , chatId , userId);

        if(error || !success){
            res.status(500).json({ error : error })
            return;
        }

        res.json({ message : "successfully deleted message!!" });
    }catch(err){
        console.log("An error occured while trying to delete a message : " , err);
        res.status(500).json({ error : "Internal server error!" });
    }
});