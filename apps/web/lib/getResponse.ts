import { FileMetaData } from "@/components/ChatInput";
import { Message } from "@/types/next-auth-extensions";
import { ModelType } from "@repo/types"
import { SessionContextValue } from "next-auth/react"
import { Dispatch, SetStateAction } from "react";

interface GetResponseProps{
    chatId : string;
    prompt : string;
    selectedModel : ModelType;
    isRedirected : boolean;
    session : SessionContextValue;
    attachments? : Attachment[] | FileMetaData[],
    setIsLoading : (prev : any) => void;
    setMessages : (prev : any) => void;
    isSearchEnabled : boolean,
    parseStream : (reader : ReadableStreamDefaultReader<Uint8Array>) => Promise<void>;
}

interface RequestMessage{
    role : 'user' | 'assistant',
    content : string,
    id? : string,
    attachments? : Attachment[]
}

interface GetResponseRequest{
    messages : RequestMessage[],
    model : ModelType,
    chatId : string,
    modelParams : {
        includeSearch : boolean,
        includeReasoning : boolean
    },
    redirected : boolean
}

interface GetMessageResponseProps{
    chatId : string;
    messages : Message[],
    selectedModel : ModelType;
    isRedirected : boolean;
    isSearchEnabled : boolean,
    session : SessionContextValue;
    parseStream : (reader : ReadableStreamDefaultReader<Uint8Array>) => Promise<void>;
}

export interface Attachment{
    fileName : string,
    fileKey : string,
    fileType : string,
    fileSize : string,
    fileId : string
}

interface SubmitPromptProps{
    prompt : string,
    messages : Message[],
    setMessages : Dispatch<SetStateAction<Message[]>>,
    selectedModel : ModelType,
    setIsLoading : (prev : boolean) => void,
    isRedirected : boolean,
    session : SessionContextValue,
    chatId : string,
    parseStream : (reader : ReadableStreamDefaultReader<Uint8Array>) => Promise<void>,
    attachments : FileMetaData[] | Attachment[] | undefined,
    isSearchEnabled : boolean
}

export const submitPrompt = async({
    setMessages ,
    messages ,
    prompt,
    selectedModel ,
    setIsLoading ,
    isRedirected ,
    session ,
    chatId ,
    parseStream ,
    attachments ,
    isSearchEnabled 
} : SubmitPromptProps) => {
    try{
        if(!prompt || prompt.trim().length === 0 || !session.data) return false;
        
        const pastMessages : Message[] = [...messages];

        if(isRedirected === false){
            pastMessages.push({
                prompt,
                response: '',
                reasoning: '',
                sources: [],
                error : '',
                modelName: '',
                finishReason: '',
                totalTokens: 0,
                completionTokens: 0,
                promptTokens: 0,
                responseTime: 0,
                attachments : attachments && attachments.length > 0 ? 
                    attachments.map((attachment) => {
                        if ('file' in attachment) {
                            return {
                                fileName: attachment.file.name,
                                fileKey: attachment.objectKey,
                                fileType: attachment.file.type,
                                fileSize: attachment.file.size.toString(),
                                fileId: attachment.fileId
                            } as Attachment;
                        }
                        else{
                            return {
                                fileName: attachment.fileName,
                                fileKey: attachment.fileKey,
                                fileType: attachment.fileType,
                                fileSize: attachment.fileSize,
                                fileId: attachment.fileId
                            }
                        }
                    }) : undefined
            });

            setMessages((prev: Message[]) => {
                const prevMessages = prev;
                return [
                ...prevMessages,
                    {
                        prompt,
                        response: '',
                        reasoning: '',
                        sources: [],
                        error : '',
                        modelName: '',
                        finishReason: '',
                        totalTokens: 0,
                        completionTokens: 0,
                        promptTokens: 0,
                        responseTime: 0,
                        attachments : (attachments && attachments.length > 0) ? 
                            attachments.map((attachment) => {
                                if ('file' in attachment) {
                                    return {
                                        fileName: attachment.file.name,
                                        fileKey: attachment.objectKey,
                                        fileType: attachment.file.type,
                                        fileSize: attachment.file.size.toString(),
                                        fileId: attachment.fileId
                                    } as Attachment;
                                }
                                else{
                                    return {
                                        fileName: attachment.fileName,
                                        fileKey: attachment.fileKey,
                                        fileType: attachment.fileType,
                                        fileSize: attachment.fileSize,
                                        fileId: attachment.fileId
                                    }
                                }
                            }) : undefined
                    } as Message
                ];
            });
        }

        setIsLoading(true);

        await getMessageResponse({
            chatId,
            messages : pastMessages,
            session : session,
            selectedModel : selectedModel,
            isRedirected : isRedirected,
            parseStream : parseStream,
            isSearchEnabled : isSearchEnabled
        });

    }catch(err){
        console.log("An error occured while submitting prompt : " , err);
        return false;
    }
}

export const getMessageResponse = async ({
    chatId,
    messages,
    session,
    selectedModel,
    isRedirected,
    parseStream,
    isSearchEnabled = false,
} : GetMessageResponseProps) => {
    try{
        if(!session.data) return null;

        const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/chat`;
     
        const requestMessages : RequestMessage[] = [];
        for(var i = 0 ; i < messages.length ; i++){
            const _message = messages[i]!;

            requestMessages.push({
                role : 'user',
                content : _message.prompt,
                attachments : (_message.attachments && _message.attachments.length > 0) ? 
                    _message.attachments.map((attachment) => {
                        return {
                            fileName: attachment.fileName,
                            fileKey: attachment.fileKey,
                            fileType: attachment.fileType,
                            fileSize: attachment.fileSize,
                            fileId: attachment.fileId
                        }
                    }) : undefined
            });

            if(_message.response && _message.response.length > 0){
                requestMessages.push({
                    role : 'assistant',
                    content : _message.response,
                });
            }
        }

        const bodyToSend : GetResponseRequest = {
            chatId: chatId,
            redirected: isRedirected,
            messages : requestMessages,
            modelParams : {
                includeReasoning : true,
                includeSearch : isSearchEnabled
            },
            model : selectedModel
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${session.data.user.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyToSend),
        });

        const reader = response.body?.getReader();
        if(reader) parseStream(reader);
        
    }catch(err){
        console.log("An error occured while getting llm response : " , err);
    }
}