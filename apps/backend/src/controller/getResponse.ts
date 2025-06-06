import { ModelType } from "@repo/types"
import { Response } from "express"
import { CoreMessage, FinishReason, GeneratedFile, generateObject, LanguageModelUsage, LanguageModelV1, streamText } from "ai"
import { createGoogleGenerativeAI, GoogleGenerativeAIProviderOptions } from "@ai-sdk/google"
import z from 'zod';
import { systemPrompt } from "../utils/prompt"
import { convertRequestMessagesToCoreMessages } from "../utils/util"
import { initializeModel } from "./getLanguageModel"
import { insertFinalMessage, updateChatName } from "./db"
import { LanguageModelV1ProviderMetadata } from "@ai-sdk/provider"
import fs from "fs";
import path from "path";

export interface FileMetaData{
    fileName : string,
    fileId : string | null,
    fileType : string,
    fileSize : string | null,
    fileKey : string
}

export interface RequestMessage{
    role : 'user' | 'assistant'
    content : string,
    id? : string,
    attachments? : FileMetaData[],
}

interface HandleRequestProps{
    messages : RequestMessage[],
    redirected : boolean,
    includeSearch : boolean,
    expressResponse : Response,
    includeReasoning : boolean,
    model : ModelType,
    chatId : string
}

interface GenerateLLMResponseProps{
    chatId : string,
    expressResponse : Response,
    messages : CoreMessage[],
    startTime : number,
    modelId : ModelType,
    model : LanguageModelV1,
    attachments? : FileMetaData[],
    prompt : string,
    includeSearch? : boolean,
    includeReasoning? : boolean
}

interface PickModelProps{
    messages : CoreMessage[],
    model : ModelType,
    includeSearch : boolean,
}

interface Source{
    sourceType: 'url';
    id: string;
    url: string;
    title?: string;   
    providerMetadata?: LanguageModelV1ProviderMetadata;
}

interface OnFinishCallback{
    finishReason : FinishReason,
    reasoning : string | undefined,
    text : string,
    usage : LanguageModelUsage
    sources : Source[],
    startTime : number,
    expressResponse : Response,
    modelId : ModelType,
    prompt : string,
    chatId : string,
    attachments? : FileMetaData[],
    includeSearch? : boolean,
    includeImage? : boolean
}

interface HandleChatNameProps{
    chatId : string,
    prompt : string
}

export const handleRequest = async ({
    messages,
    includeReasoning,
    includeSearch,
    expressResponse,
    model,
    chatId
} : HandleRequestProps) => {
    try{
        const pastMessages = await convertRequestMessagesToCoreMessages(messages);

        const startTime = performance.now();
        const modelId = await chooseModel({ messages : pastMessages, model , includeSearch });
        if(modelId === null) return null;

        const askRequestProps = { 
            messages : pastMessages,
            chatId : chatId,
            expressResponse : expressResponse,
            startTime : startTime,
            includeSearch : includeSearch,
            includeReasoning : includeReasoning,
            prompt : messages[messages.length-1].content,
            attachments : messages[messages.length-1]?.attachments
        }
        const { modelsToTry } = initializeModel( includeSearch );

        const attemptModelRequest = async (model : LanguageModelV1 , modelName : ModelType , ) => {
            try{
                const success = await generateLLMResponse({ ...askRequestProps , model : model , modelId : modelName } as GenerateLLMResponseProps)
                if(success) return true;
                else return false;
            }catch(err){
                console.error(`Error with model ${modelName}:`, err);
                return false;
            }
        }

        const finalModel = modelsToTry.find((m) => m.modelName === modelId) || modelsToTry[0];
        var success = await attemptModelRequest(finalModel.model , finalModel.modelName);

        if(!success) { 
            expressResponse.write(`data: ${JSON.stringify({ type: 'error', content : `Couldn't get response with model ${finalModel.modelName} retrying with ${modelsToTry[0].modelName}...` , modelID : finalModel.modelName })}\n\n`);
            success = await attemptModelRequest(modelsToTry[0].model , modelsToTry[0].modelName);

            if(success) return true;
            else return false;
        }
        
        return true;
    }catch(err){
        console.log("An error occured while generating response : " , err);
        return false;
    }
}

const generateLLMResponse = async({
    messages,
    chatId,
    expressResponse,
    model,
    modelId,
    startTime,
    attachments,
    prompt,
    includeSearch = false,
    includeReasoning = false
} : GenerateLLMResponseProps) => {
    try{
        var success = true;

        const stream = streamText({
            model : model,
            messages : messages,
            providerOptions : {
                google: { 
                    thinkingConfig : { 
                        thinkingBudget : model.modelId === 'gemini-2.0-flash-001' ? 0 : 24576 ,
                        includeThoughts : includeReasoning
                    } 
                } satisfies GoogleGenerativeAIProviderOptions,
            },

            onChunk({ chunk }){
                if(chunk.type === 'reasoning'){
                    expressResponse.write(`data: ${JSON.stringify({ type: 'reasoning', content: chunk.textDelta })}\n\n`);
                }
                else if(chunk.type === 'text-delta'){
                    expressResponse.write(`data: ${JSON.stringify({ type: 'response', content: `${chunk.textDelta} ` })}\n\n`);
                }
                else if(chunk.type === 'source'){
                    expressResponse.write(`data: ${JSON.stringify({ type: 'source', content: chunk.source })}\n\n`);
                }
            },

            onFinish : async ({ finishReason , reasoning , text , usage , sources  }) => {
                success = await onFinishCallback({
                    finishReason : finishReason,
                    reasoning : reasoning,
                    text : text,
                    usage : usage,
                    attachments : attachments,
                    chatId : chatId,
                    startTime : startTime,
                    modelId : modelId,
                    expressResponse : expressResponse,
                    sources : sources,
                    prompt : prompt,
                    includeImage : false,
                    includeSearch : includeSearch
                });
            },

            onError : ({ error }) => {
                console.log("An error occured while generating response : " , error);
                success = false;
            }
        })

        var fullResponse = "";

        for await (const delta of stream.textStream){
            fullResponse += delta;
        }

        for (const file of await stream.files){
            console.log('file response : ' , file);
            if(file.mimeType.startsWith('image/')){
                saveImage(file);
            }
        }

        if(!success) return false;
        return true;
    }catch(err){
        console.log("An error occured while fetching response using llm : " , err);
        return false;
    }
}

const saveImage = async (file : GeneratedFile) => {
    // Define your destination directory (ensure this path is correct for your environment)
    const destinationDir = "./downloads/";

    // Ensure the destination directory exists
    if (!fs.existsSync(destinationDir)) {
       fs.mkdirSync(destinationDir, { recursive: true });
    }
    
    if (file.base64) {
      const imageBuffer = Buffer.from(file.base64, "base64");
      const fileName = `image-${Date.now().toString().slice(0,4)}.png`;
      const filePath = path.join(destinationDir, fileName);

      fs.writeFileSync(filePath, imageBuffer);
      console.log("Image saved to:", filePath);

    } else {
      console.error("Base64 property not found on file object");
    }   
}

const chooseModel = async ({ messages, model, includeSearch } : PickModelProps) : Promise<ModelType | null> => {
    try{
        if(model != 'auto') return model;
        
        const gemini = createGoogleGenerativeAI({ apiKey : process.env.GEMINI_KEY });
        const response = await generateObject({
            model : gemini('gemini-2.0-flash-lite' , { useSearchGrounding : includeSearch }),
            schema : z.object({ modelName : z.string() }),
            messages : messages,
            system : systemPrompt
        });
        
        return response.object['modelName'] as ModelType;
    }catch(err){
        console.log("An error occured while picking model : " , err);
        return null;
    }
}

const onFinishCallback = async ({ 
    finishReason,
    text,
    reasoning,
    startTime,
    usage,
    sources,
    expressResponse,
    modelId,
    prompt,
    chatId,
    attachments,
    includeImage = false,
    includeSearch = false
} : OnFinishCallback) => {
    try{
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        const details = { 
            finishReason , 
            totalTokens : usage.totalTokens , 
            completionTokens : usage.completionTokens , 
            promptTokens : usage.promptTokens ,
            modelUsed : modelId,
            responseTime : responseTime
        };
        
        expressResponse.write(`data: ${JSON.stringify({ type: 'details', content : details })}\n\n`);

        const message = await insertFinalMessage({ 
            prompt : prompt,
            content : text,
            modelName : modelId,
            chatId : chatId,
            finishReason : finishReason,
            reasoning : reasoning ?? null,
            completionTokens : usage.completionTokens,
            promptTokens : usage.promptTokens,
            totalTokens : usage.totalTokens,
            responseTime : responseTime,
            sources : sources,
            includeSearch : includeSearch,
            includeImage : includeImage,
            attachments : attachments
        });

        if(message === null) return false;

        expressResponse.write(`data: ${JSON.stringify({ type: "messageId", content: message.id })}\n\n`);
        return true;
    }catch(err){
        console.log("An error occured while storing message details : " , err);
        return false;
    }
}

export const handleChatName = async({
    chatId,
    prompt
} : HandleChatNameProps) => {
    try{
        const gemini = createGoogleGenerativeAI({ apiKey : process.env.GEMINI_KEY });
        const response = await generateObject({
            model : gemini('gemini-2.0-flash' , { useSearchGrounding : true }),
            system : `You are an assistant whose job is just to create a chat name on the basis of the user's prompt. Make sure the chat name is relevant to the user's prompt and keep it short, concise and professional.`,
            prompt : prompt,
            schema : z.object({ chatName : z.string() })
        })
        const chatName = response.object['chatName'];

        await updateChatName(chatId , chatName);
        return true;
    }catch(err){
        console.log("An error occured while handling chat name : " , err);
        return false;
    }
}