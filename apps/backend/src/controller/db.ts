import db from "@repo/db";
import { ModelType } from "@repo/types/src/types/chat";

export interface User{
    userId : string,
    name : string,
    email : string,
    token : string | null,
    phoneNumber : string | null
}

export interface MessageType{
    prompt : string,
    response : string | null
}

export interface StoreMessageProps{
    messageId : string,
    content : string,
    modelName : ModelType,
    chatId : string,
    finishReason : string,
    reasoning : string | null,
    completionTokens : number,
    promptTokens : number,
    totalTokens : number,
    responseTime : number
}   

export interface CreateChatProps {
    chatName : string,
    userId : string,
}

// returns the last 6 chats for a chatId
export const getLastChats = async (chatId : string) : Promise<MessageType[]>  => {
    try{
        const chat = await db.chat.findFirst({
            where : { id : chatId },
            include : {
                messages : { 
                    select : {
                        prompt : true,
                        response : true
                    },
                    orderBy : { createdAt : 'desc' },
                }
            }
        });

        if(chat){
            return chat.messages
        }

        return [];
    }catch(err){
        console.log("An error occured while fetching last chats : " , err);
        return [];
    }
}

export const storeMessageResponse = async (messageProps : StoreMessageProps) => {
    try{
        const chat = await db.chat.findFirst({ where : { id : messageProps.chatId } });

        if(!chat) return null;

        const message = await db.message.update({
            where : { id : messageProps.messageId },
            data : {
                chatId : messageProps.chatId,
                response : messageProps.content,
                modelName : messageProps.modelName,
                reasoning : messageProps.reasoning,
                finishReason : messageProps.finishReason,
                completionTokens : messageProps.completionTokens,
                promptTokens : messageProps.promptTokens,
                totalTokens : messageProps.totalTokens,
                responseTime : messageProps.responseTime || 0,
                liked : false,
            }
        });

        await db.chat.update({
            where : { id : chat.id },
            data : { lastUsedAt : new Date() }
        });

        return message;
    }catch(err){
        console.log("An error occured while storing a message : " , err);
        return null;
    }
}


export const getChat = async (chatId : string) => {
    try{
        const chat = await db.chat.findFirst({ where : { id : chatId } });
        if(!chat || chat === null) return null;
        else return chat;
    }catch(err){
        console.log("An error occured while checking chatId : " , null);
        return null;
    }
}

export const createNewChat = async (chatProps : CreateChatProps) => {
    try{
        const user = await db.user.findFirst({ where : { id : chatProps.userId } });

        if(!user) return null;

        const chat = await db.chat.create({
            data : {
                name : chatProps.chatName,
                userId : user.id
            }
        });

        return chat.id;
    }catch(err){
        console.log("An error occured while creating a new chat : " , err);
        return null;
    }
}

// Initialize a chat with the name "New Chat" which gets updated when the user asks a query
export const createNewChatWithoutName = async ({ userId } : { userId : string }) => {
    try{

        const chat = await db.chat.create({
            data : {
                name : "New Chat",
                userId : userId,
            }
        });

        return chat;
    }catch(err){
        console.log("An error occured while creating a chat : " , err);
        return null;
    }
}

export const getUser = async (userId : string) : Promise<User | null> => {
    try{
        if(!userId || userId.length === 0) return null;

        const user = await db.user.findFirst({ 
            where : { id : userId } ,
            select : {
                id : true,
                name : true,
                token : true,
                email : true,
                phoneNumber : true
            }
        });
        
        if(!user || user === null){
            return null;
        }

        return {
            userId : user.id,
            name : user.name,
            email : user.email,
            phoneNumber : user.phoneNumber,
            token : user.token,
        }
    }catch(err){
        console.log("An error occured while fetching user : " , err);
        return null;
    }
}

export const getChats = async(userId : string) => {
    try{
        const chats = await db.chat.findMany({ 
            where : { userId : userId },
            orderBy : { lastUsedAt : 'desc' },
            select : {
                id : true,
                name : true,
                lastUsedAt : true,
                createdAt : true
            }
        });

        return chats;
    }catch(err){
        console.log("An error occured while fetching chats : " , err);
        return null;
    }
}

export const getMessagesByChatId = async (chatId : string) => {
    try{
        const chat = await db.chat.findFirst({ where : { id : chatId } });
        if(!chat || chat === null) return null;

        const messages = await db.message.findMany({
            where : { chatId : chatId },
            orderBy : { createdAt : 'desc' },
            select : {
                id : true,
                prompt : true,
                createdAt : true,
                reasoning : true,
                response : true,
                responseTime : true,
                totalTokens : true,
                completionTokens : true,
                promptTokens : true,
                liked : true,
                finishReason : true,
                modelName : true
            }
        });

        return messages;
    }catch(err){
        console.log("An error occured while fetching messages : " , err);
        return null;
    }
}

export const deleteChat = async (chatId : string) => {
    try{
        const chat = await db.chat.findFirst({ where : { id : chatId } });
        if(!chat || chat === null) return false;

        return await db.$transaction(async (prisma) => {
            // Delete messages first
            await prisma.message.deleteMany({
              where: { chatId: chatId }
            });
      
            // Then delete the chat
            const deletedChat = await prisma.chat.delete({
              where: { id: chatId }
            });
      
            return !!deletedChat;
        });
        
    }catch(err){
        console.log("An error occured while deleting chat : " , err);
        return false;
    }
}

export const updateChatName = async (chatId : string , chatName : string) => {
    try{
        const chat = await db.chat.update({
            where : { id : chatId },
            data : {
                name : chatName
            }
        });

        return chat
    }catch(err){
        console.log("An error occured while creating the chat name : " , err);
        return null;
    }
}

export const storeUserPrompt = async(chatId : string , userPrompt : string) => {
    try{
        const message = await db.message.create({ 
            data : {
                chatId : chatId,
                prompt : userPrompt
            }
        });

        return message;
    }catch(err){
        console.log("An error occured while storing user prompt in chat : " , err);
        return null;
    }
}

export const deleteLastMessageFromChat = async(chatId : string , userId : string) => {
    try{
        const chat = await db.chat.findFirst({ 
            where : { 
                id : chatId ,
                userId : userId
            },
            include : {
                messages : {
                    orderBy : { createdAt : 'desc' },
                    take : 1
                }
            } 
        });

        if(!chat || chat === null || chat.messages.length == 0){
            return { message : null , error : "No chat exist with the given userId and chatId!" };
        }

        if(chat.messages[0].response !== null){
            return { message : null , error : "Last message has a response thus cannot delete it!" };
        }

        const deletedMessage = await db.message.delete({ where : { id : chat.messages[0].id } });
        
        return { message : deletedMessage , error : null };

    }catch(err){ 
        console.log("An error occured while deleting the last message : " , err);
        return { message : null , error : "Could not able to delete the message" };
    } 
}

export const deleteMessage = async (messageId : string , chatId : string , userId : string) => {
    try{
        const chat = await db.chat.findFirst({ where : { id : chatId , userId : userId } });
        if(chat == null){
            return { success : false , error : "No chats exist with the given inputs!" };
        }

        const message = await db.message.delete({ where : { id : messageId , chatId : chat.id } });
        if(message == null){
            return { success : false , error : "No message exist with the given messageId" };
        }

        return { success : true , error : null };
    }catch(err){
        console.log("An error occured while deleting an message : " , err);
        return { success : false , error : "Internal server error!" }
    }
}
