import { Message } from "@/types/next-auth-extensions";
import { ModelType } from "@repo/types/src/types/chat";
import { SessionContextValue } from "next-auth/react";

interface FetchModelResponseProps{
    chatId : string,
    prompt : string,
    selectedModel : ModelType,
    isRedirected : boolean,
    session : SessionContextValue,
    setIsLoading : (prev : any) => void,
    setMessages : (prev : any) => void
}

export const fetchModelResponse = async ({ 
    chatId, 
    prompt, 
    session,
    selectedModel,
    isRedirected,
    setIsLoading,
    setMessages,
}: FetchModelResponseProps) => {
    try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/chat?model=${selectedModel}`;
        if (!session.data) return;

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
        const decoder = new TextDecoder();
        
        if (!reader) return;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const events = chunk.split('\n\n');

            for (const event of events) {
                if (!event.trim()) continue;
                
                const match = event.match(/^data: (.*)/s);
                if (!match || !match[1]) continue;
                
                try {
                    const { type, content } = JSON.parse(match[1]);

                    switch(type) {
                        case 'messageId': {
                            configureMessage(setMessages, 'id' as keyof Message, content);
                            break; 
                        }
                    
                        case 'reasoning': {
                            setIsLoading(false);
                            setMessages((prev : Message[]) => {
                                const lastIndex = prev.length - 1;
                                if (lastIndex < 0) return prev;
                                
                                return [
                                    ...prev.slice(0, lastIndex),
                                    {
                                        ...prev[lastIndex],
                                        reasoning: (prev[lastIndex]?.reasoning || '') + content
                                    }
                                ];
                            });
                            break;
                        }                    
                    
                        case 'response': {
                            setIsLoading(false);
                            setMessages((prev : Message[]) => {
                                const lastIndex = prev.length - 1;
                                if (lastIndex < 0) return prev;
                                
                                return [
                                    ...prev.slice(0, lastIndex),
                                    {
                                        ...prev[lastIndex],
                                        response: (prev[lastIndex]?.response || '') + content
                                    }
                                ];
                            });
                            break;
                        }
                    
                        case 'source': {
                            configureMessage(setMessages, 'sources', content);
                            break;
                        }
                        
                        case 'details': {
                            // Update all details in one operation
                            setMessages((prev: Message[]) => {
                                const lastIndex = prev.length - 1;
                                if (lastIndex < 0) return prev;
                    
                                return [
                                    ...prev.slice(0, lastIndex),
                                    {
                                        ...prev[lastIndex],
                                        modelName : content.modelUsed,
                                        finishReason: content.finishReason,
                                        totalTokens: content.totalTokens,
                                        completionTokens: content.completionTokens,
                                        promptTokens: content.promptTokens,
                                        responseTime: content.responseTime
                                    }
                                ];
                            });
                            break;
                        }
                    
                        case 'error': {
                            configureMessage(setMessages, 'error', content);
                            break;
                        }
                    
                        default: {
                            console.log("Unknown event type:", type, content);
                            break;
                        }
                    }

                } catch (err) {
                    console.error('Error parsing stream chunk:', err);
                    configureMessage(setMessages , 'error' , 'Could not parse the input!!');
                }
            }
        }
    
    } catch (err) {
        console.error("Error fetching stream:", err);
        setIsLoading(false);
        setMessages((prev: Message[]) => {
            const lastIndex = prev.length - 1;
            if (lastIndex < 0) return prev;
            
            return [
                ...prev.slice(0, lastIndex),
                { 
                    ...prev[lastIndex], 
                    error: 'Failed to fetch response',
                    isComplete: true 
                }
            ];
        });
    }
}

const configureMessage = (setMessages: (prev: any) => void, key: keyof Message, value: any) => {
    setMessages((prev: Message[]) => {
        const lastIndex = prev.length - 1;
        if (lastIndex < 0) return prev;

        const currentMessage = { ...prev[lastIndex] };
        
        return [
            ...prev.slice(0, lastIndex),
            { 
                ...currentMessage, 
                [key]: key === 'sources' 
                    ? [...(currentMessage.sources || []), value] // Handle array updates for sources
                    : value 
            }
        ];
    });
}
