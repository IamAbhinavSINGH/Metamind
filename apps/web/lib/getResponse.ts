import { FileMetaData } from "@/components/ChatInput";
import { Message } from "@/types/next-auth-extensions";
import { ModelType } from "@repo/types"
import { SessionContextValue } from "next-auth/react"

interface GetResponseProps{
    chatId : string;
    prompt : string;
    selectedModel : ModelType;
    isRedirected : boolean;
    session : SessionContextValue;
    attachments? : Attachment[] | FileMetaData[],
    setIsLoading : (prev : any) => void;
    setMessages : (prev : any) => void;
    parseStream : (reader : ReadableStreamDefaultReader<Uint8Array>) => Promise<void>;
}

export interface Attachment{
    fileName : string,
    fileKey : string,
    fileType : string,
    fileSize : string,
    fileId : string
}

export const getResponse = async({
    chatId,
    prompt,
    session,
    attachments,
    selectedModel,
    isRedirected,
    setIsLoading,
    setMessages,
    parseStream
} : GetResponseProps) => {
    try{
        if(!session.data) return null;

        const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/chat?model=${selectedModel}`;

        setIsLoading(true);
        setMessages((prev: Message[]) => {
            const prevMessages = isRedirected ? [] : prev;
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
                    attachments : attachments?.map((attachment) => {
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
                    }),
                } as Message
            ];
        });

        const bodyToSend: {
            chatId: string;
            prompt: string;
            redirected: boolean;
            attachments?: Attachment[];
        } = {
            chatId: chatId,
            prompt: prompt,
            redirected: isRedirected,
        };

        if(attachments && attachments.length > 0){
            bodyToSend.attachments = attachments.map((attachment) => {
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
            });
        }

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