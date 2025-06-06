import { FileMetaData } from "@/components/ChatInput";
import { Attachment } from "@/lib/getResponse";
import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user : {
            userId : string,
            name : string,
            token : string,
            email : string,
            image : string | null
        }
    }
}

export interface ChatHistory{
    id : string,
    name : string,
    createdAt : Date,
    lastUsedAt : Date,
}


export interface Message {
    id? : string,
    prompt : string,
    createdAt? : string | null,
    reasoning? : string | null,
    response? : string | null,
    responseTime? : number | null,
    totalTokens?: number | null;  
    completionTokens? : number | null,
    promptTokens? : number | null,
    liked? : boolean | null,
    finishReason? : string | null,
    modelName? : string | null,
    attachments? : Attachment[] | null
    sources?: MessageSource[],
    error?: string, // New field for error messages
    includeSearch?: boolean,
    includeImage?: boolean,
}

export interface MessageSource{
    sourceType : string,
    id : string,
    title : string,
    url : string
    providerMetadata? : any
}