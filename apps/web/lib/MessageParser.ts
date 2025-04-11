
export interface OnFinishCallbackProps{
    responseTime? : string
    modelUsed? : string
    finishReason? : string
    totalTokens? : string,
    completionTokens? : string
    promptTokens? : string
}

export interface ParserCallbacks{
    onResponse? : (text : string) => void
    onReason? : (text : string) => void
    onStart? : (messageId : string) => void
    onError? : (error : Error) => void
    onFinish? : (details : OnFinishCallbackProps) => void
    onSource? : (sources : string[]) => void
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

                    switch(type){
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
                            this._options.callbacks?.onFinish?.(content);
                            break;
                        }

                        case 'error' : {
                            this._options.callbacks?.onError?.(content);
                            break;
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