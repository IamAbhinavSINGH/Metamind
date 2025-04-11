import { Message } from "@/types/next-auth-extensions";
import { ModelType } from "@repo/types/src/types/chat"
import { SessionContextValue } from "next-auth/react"

interface GetResponseProps{
    chatId : string;
    prompt : string;
    selectedModel : ModelType;
    isRedirected : boolean;
    session : SessionContextValue;
    setIsLoading : (prev : any) => void;
    setMessages : (prev : any) => void;
    parseStream : (reader : ReadableStreamDefaultReader<Uint8Array>) => Promise<void>;
}

export const getResponse = async({
    chatId,
    prompt,
    session,
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
                    messageId: '',
                    sources: [],
                    modelName: '',
                    finishReason: '',
                    totalTokens: 0,
                    completionTokens: 0,
                    promptTokens: 0,
                    responseTime: 0
                }
            ];
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${session.data.user.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chatId: chatId,
                prompt: prompt,
                redirected: isRedirected
            }),
        });

        const reader = response.body?.getReader();
        if(reader){
            parseStream(reader);
        }
    }catch(err){
        console.log("An error occured while getting llm response : " , err);
    }
}