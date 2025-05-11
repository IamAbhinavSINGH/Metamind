import { useCallback, useEffect, useRef } from "react";
import { ChatMetadataCallbackProps, MessageParser, MessageParserOptions, OnFinishCallbackProps, ParserCallbacks } from "./MessageParser";
import { Message, MessageSource } from "@/types/next-auth-extensions";
import { useChatHistory } from "./providers/ChatHistoryContext";

interface UseMessageParserProps{
    setIsLoading : (value : boolean) => void
    setMessages : (updater : (prev : Message[]) => Message[]) => void;
}

export const useMessageParser = ({
    setIsLoading , 
    setMessages
} : UseMessageParserProps ) => {
    const parserRef = useRef<MessageParser | null>(null);
    const { setChatName } = useChatHistory();

    const callbacks : ParserCallbacks = {

        onStart : useCallback((messageId : string) => {
            setMessages((prev : Message[]) => {
                if (prev.length === 0) return prev;
                const lastIndex = prev.length - 1;
                const currentMessage = { ...prev[lastIndex] };

                return [
                    ...prev.slice(0 , lastIndex),
                    ({ ...currentMessage , id : messageId  }) as Message
                ];
            })
        }, [setMessages]),

        onResponse : useCallback((text : string) => {
            setIsLoading(false);
            setMessages((prev : Message[]) => {
                if(prev.length === 0) return prev;
                const lastIndex = prev.length - 1;
                const currentMessage = { ...prev[lastIndex] };

                return [
                    ...prev.slice(0 , lastIndex),
                    ({ ...currentMessage , response : (currentMessage.response || '') + text }) as Message
                ];
            })
        }, [setMessages]),

        onSource : useCallback((source : MessageSource) => {
            setMessages((prev : Message[]) => {
                if(prev.length === 0) return prev;
                const lastIndex = prev.length-1;
                const currentMessage = { ...prev[lastIndex] };

                return [
                    ...prev.slice(0 , lastIndex),
                    (
                        {
                            ...currentMessage,
                            sources : [...currentMessage.sources ?? [] , source]
                        }
                    ) as Message
                ]; 
            })
        }, [setMessages]),

        onReason : useCallback((reasoning : string) => {
            setIsLoading(false);
            setMessages((prev : Message[])  => {
                if(prev.length === 0) return prev;
                const lastIndex = prev.length - 1;
                const currentMessage = { ...prev[lastIndex] };

                return [
                    ...prev.slice(0 , lastIndex),
                    ({ ...currentMessage , reasoning : (currentMessage.reasoning || '') + reasoning }) as Message
                ];
            })
        } , [setIsLoading , setMessages]),

        onFinish : useCallback((details : OnFinishCallbackProps) => {
            setIsLoading(false);
            setMessages((prev : Message[]) => {
                if(prev.length === 0) return prev;
                const lastIndex = prev.length-1;
                const currentMessage = { ...prev[lastIndex] };

                return [
                    ...prev.slice(0 , lastIndex),
                    (
                        {
                            ...currentMessage,
                            modelName : details.modelUsed,
                            finishReason : details.finishReason,
                            totalTokens : details.totalTokens,
                            completionTokens : details.completionTokens,
                            promptTokens : details.promptTokens,
                            responseTime : details.responseTime
                        }
                    ) as Message
                ]; 
            })
        }, [setMessages]),

        onChatMetadata : useCallback((chatMetadata : ChatMetadataCallbackProps) => {
            console.log("chatMetadata : " , chatMetadata);
            setChatName(chatMetadata.chatId , chatMetadata.chatName);
        } , [setMessages]),

        onError : useCallback((errorMessage : string) => {
            console.log("An error occured in backend : " , errorMessage );

            setMessages((prev : Message[]) => {
                if(prev.length === 0) return prev;
                const lastIndex = prev.length - 1;
                const currentMessage = { ...prev[lastIndex] };

                return [
                    ...prev.slice(0 , lastIndex),
                    ({ ...currentMessage , error : errorMessage }) as Message
                ]
            })
        }, [setMessages]) 
    }

    useEffect(() => {
        if(parserRef.current == null){
            const options : MessageParserOptions = { callbacks }
            parserRef.current = new MessageParser(options);
        }
    }, [callbacks]);

    const parseStream = useCallback(async (reader : ReadableStreamDefaultReader<Uint8Array>) => {
        if(!parserRef.current) return;
        parserRef.current.parse(reader);
    }, []);

    return { parseStream };
}
