import { MessageSource } from "@/types/next-auth-extensions"

export interface OnDetailsCallbackProps{
    responseTime? : string
    modelUsed? : string
    finishReason? : string
    totalTokens? : string,
    completionTokens? : string
    promptTokens? : string
}

export interface OnFinishCallbackProps{
    wasRequestSuccessfull : boolean
}

export interface ChatMetadataCallbackProps{
    chatId : string,
    chatName : string,
    lastUsedAt : number,
}

export interface ParserCallbacks{
    onResponse? : (text : string) => void
    onReason? : (text : string) => void
    onStart? : (messageId : string) => void
    onError? : (error : string) => void
    onFinish? : (details : OnFinishCallbackProps) => void
    onDetails? : (details : OnDetailsCallbackProps) => void
    onSource? : (sources : MessageSource) => void
    onChatMetadata? : (chatMetadata : ChatMetadataCallbackProps) => void
}

export interface MessageParserOptions{
    callbacks? : ParserCallbacks
}

export class MessageParser {
    public constructor(private _options : MessageParserOptions){}

    async parse (reader : ReadableStreamDefaultReader) {
        const decoder = new TextDecoder();

        while(true){
            const { done , value } = await reader.read();
            if(done) break;

            const chunk = decoder.decode(value , { stream : true });
            const events = chunk.split('\n\n');

            for (const event of events ){
                if(!event.trim()) continue;
                const match = event.match(/^data: (.*)/s);
                if(!match || !match[1]) continue;

                try{    
                    const { type , content } = JSON.parse(match[1]);

                    switch(type.toString()){
                        case 'messageId' : {
                            this._options.callbacks?.onStart?.(content);
                            break;
                        }

                        case 'reasoning' : {
                            this._options.callbacks?.onReason?.(content);
                            break;
                        }

                        case 'response' : {
                            this._options.callbacks?.onResponse?.(content);
                            break;
                        }

                        case 'source' : {
                            this._options.callbacks?.onSource?.(content);
                            break;
                        }

                        case 'details' : {
                            this._options.callbacks?.onDetails?.(content);
                            break;
                        }

                        case 'chat-metadata' : {
                            this._options.callbacks?.onChatMetadata?.(content);
                            break;
                        }

                        case 'error' : {
                            this._options.callbacks?.onError?.(content);
                            break;
                        }

                        case 'finish' : {
                            this._options.callbacks?.onFinish?.(content);
                        }

                        default : {
                            console.log("Unknown event type : " , type , content);
                            break;
                        }
                    }

                }catch(err){
                    console.log("Error while parsing stream : " , err);
                }
            }
        }
    }
}