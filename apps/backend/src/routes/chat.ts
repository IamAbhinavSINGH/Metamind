import { Router , Response } from "express";
import { AI_MODELS, chatSchema, attachmentModel  } from '@repo/types';
import { AuthRequest } from "../middleware/authMiddleware";
import { createNewChatWithoutName, deleteChat, deleteLastMessageFromChat, getChat, getMessagesByChatId, getUser, storeUserPrompt } from "../controller/db";
import { bigintReplacer } from '../utils/util';
import { z } from "zod";
import { handleRequest } from "../controller/getResponse";
import { handleChatName } from "../controller/getResponse";

export const chatRouter = Router();

const createChatScehma = z.object({ 
    prompt : z.string(), 
    modelName : z.enum(AI_MODELS),
    attachments : z.array(attachmentModel).optional() 
});


chatRouter.post('' , async (req : AuthRequest , res : Response) => {
    try{
        var userId = req.userId as string;
        const reqSchema = chatSchema.safeParse(req.body);
        if(!reqSchema.success){
            res.status(401).json({ error : "Invalid inputs!!" });
            return;
        }
        const body = reqSchema.data;
        
        const chat = await getChat(body.chatId);
        if(!chat || chat == null){
            res.status(401).json({ error : "No chats exist with the given id!!" });
            return;
        }

        // Set response headers for Server-Sent Events (SSE)
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        var isFirstRequestForThisChat = false;
        if(body.redirected){
            const { message } = await deleteLastMessageFromChat(body.chatId , userId);
            if(message !== null) isFirstRequestForThisChat = true;
        }

        res.write(`data: ${JSON.stringify({ type: 'chat-metadata', content : { chatId : chat.id , chatName : chat.name } })}\n\n`);

        await handleRequest({
            messages : body.messages,
            includeReasoning : body.modelParams.includeReasoning,
            includeSearch : body.modelParams.includeSearch,
            expressResponse : res,
            model : body.model,
            chatId : body.chatId,
            redirected : body.redirected
        });

        res.end();
        return;

    }catch(err){
        console.log('An error occured while generating user response : ' , err);
        res.status(500).json({ error : "Internal server error!!" });
    }
});

chatRouter.get('/:chatId' , async (req : AuthRequest , res : Response) => {
    try{
        const userId = req.userId as string;
        const user = await getUser(userId);

        if(!user || user === null){
            res.status(401).json({ error : "Unauthorized!!" });
            return;
        }

        const chatId = req.params.chatId as string;
        if(!chatId || chatId === null){
            res.status(400).json({ error : "Missing chatId !!" });
            return;
        }
        
        const messages = await getMessagesByChatId(chatId , userId);
        if(!messages || messages === null){
            res.status(500).json({ error : "Chat doesn't exist!!" });
            return;
        }

        res.json({ 
            messages : JSON.parse(JSON.stringify(messages , bigintReplacer))
        });

    }catch(err){
        console.log("An error occured while fetching chat messages : " , err);
        res.status(500).json({ error : "Internal server error!!" });
    }
});

chatRouter.delete('/:chatId' , async (req : AuthRequest , res : Response) => {
    try{
        const userId = req.userId as string;
        const user = await getUser(userId);

        if(!user || user === null){
            res.status(401).json({ error : "Unauthorized!!" });
            return;
        }

        const chatId = req.params.chatId;
        if(!chatId || chatId === null){
            res.status(400).json({ error : "Missing chatId !!" });
            return;
        }
        
        const isDeleted = await deleteChat(chatId);

        if(isDeleted) res.json({ message : "successfully deleted chat!!" });
        else res.status(400).json({ error : "No chat exist with the given id!!" });
    }catch(err){
        console.log("An error occured while fetching chat messages : " , err);
        res.status(500).json({ error : "Internal server error!!" });
    } 
});

chatRouter.post('/create' , async (req : AuthRequest , res : Response) => {
    try{
        const userId = req.userId as string;
        const user = await getUser(userId);

        if(!user || user === null){
            res.status(400).json({ error : "No user exist with the given id!" });
            return;
        }

        const parsedSchema = createChatScehma.safeParse(req.body);
        if(!parsedSchema.success){
            res.status(401).json({ error : "Invalid inputs" });
            return;
        }
        const body = parsedSchema.data;

        const chat = await createNewChatWithoutName({ userId : userId });
        if (!chat || chat.id === null) {
            throw new Error("Transaction failed: Could not create chat");
        }

        handleChatName({ chatId : chat.id , prompt : body.prompt });

        const message = await storeUserPrompt(chat.id, body.prompt , body.modelName , body.attachments);
        if(!message || message == null) throw new Error("Transaction failed: Could not create chat");

        res.json({ chatId: chat.id, chatName: chat.name });
    }catch(err){
        console.log("An error occured while creating chat : " , err);
        res.status(500).json({ message : "Internal server error!" });
    }
});