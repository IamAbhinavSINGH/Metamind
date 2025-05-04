import { FileMetaData } from "@/components/ChatInput";
import { Attachment } from "@/lib/getResponse";
import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user : {
            userId : string,
            name : string,
            token : string,
            email : string
        }
    }
}


export interface Message {
    id? : string,
    prompt : string,
    createdAt? : string | null,
    reasoning? : string | null,
    response? : string | null,
    responseTime? : number | null,
    totalTokens?: number | null;  // Changed from string to number
    completionTokens? : number | null,
    promptTokens? : number | null,
    liked? : boolean | null,
    finishReason? : string | null,
    modelName? : string | null,
    attachments? : Attachment[] | null
    sources?: string[]; // New field for sources
    error?: string; // New field for error messages
}