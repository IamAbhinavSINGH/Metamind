import { StreamTextResult } from "ai";
import { Response } from "express";
import { ModelType } from "@repo/types/src/types/chat";

export const writeDataToApiResponse = async (stream : StreamTextResult<any , any> , modelUsed : ModelType , res : Response) => {
    try{
        var fullResponse = '' , fullReasoning = '';

        for await (const delta of stream.textStream) {
            fullResponse += delta;
            res.write(`data: ${JSON.stringify({ data : delta , isComplete : false })}\n\n`);
        }
        
        res.write(`data: ${JSON.stringify({ data : '' , isCompleted : true , modelUsed : modelUsed })}\n\n`);
        res.end();

        return { fullResponse , fullReasoning } ;
        
    }catch(err){
        console.log('an error occured while parsing response data : ' , err);

        res.write(`data: ${JSON.stringify({ error: "Stream failed", code: "STREAM_ERROR" })}\n\n`);
        res.end();

        return { fullResponse : "" , fullReasoning : "" };
    }
}