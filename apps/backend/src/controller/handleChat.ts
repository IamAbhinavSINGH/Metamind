import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { ModelType } from "@repo/types";
import { CoreMessage, generateObject, LanguageModelV1, streamText } from "ai";
import { z } from "zod";
import { getLastChats, storeMessageResponse, storeUserPrompt, updateChatName } from "./db";
import { convertChatsToCoreMessages } from "../utils/util";
import { Response } from "express";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";


interface HandleRequestProps{
    prompt : string,
    chatId : string,
    userId : string,
    firstRequest : boolean,
    model : ModelType,
    expressResponse : Response
}

interface InitializeChatProps{
    chatId : string,
    prompt : string,
    userId : string,
    model : ModelType,
    firstRequest : boolean
}

interface GetResponseProps {
    prompt : string,
    chatId : string,
    messageId : string,
    pastMessages : CoreMessage[],
    model : LanguageModelV1,
    expressResponse : Response,
    modelName : ModelType
}

interface ModelDescription {
    modelName : string,
    modelDescription : string
}

const availableModels: ModelDescription[] = [
    {
      modelName: 'gemini-2.0-flash-001',
      modelDescription: `Best at general day-to-day tasks but not optimal for highly complex tasks like advanced coding or intricate mathematical problems.
        It natively calls tools (e.g., search, stream images/video in realtime) and is the default model for casual conversation.`
    },
    {
      modelName: 'gemini-2.0-pro-exp-02-05',
      modelDescription: `A day-to-day model by Google that improves upon the general Gemini-2.0 in coding, math, and complex tasks.
        It is less focused on introspective "thinking" and more on delivering quick, accurate responses.`
    },
    {
      modelName: 'gemini-2.0-flash-thinking-exp-01-21',
      modelDescription: `Google’s Gemini family "thinking" variant that provides a bit more internal reasoning.
        It’s better than the pro model for tasks requiring a higher level of logical processing and step-by-step analysis,
        though it may not be as specialized for heavy coding challenges.`
    },
    {
      modelName: 'deepseek-reasoner',
      modelDescription: `A series of advanced AI models designed for tackling complex reasoning tasks in science, coding, and mathematics.
        Optimized to "think before they answer," it produces detailed internal chains of thought for solving challenging problems.
        Ideal for tasks where deep reasoning and detailed step-by-step analysis are critical.`
    },
    {
      modelName: 'deepseek-chat',
      modelDescription: `A distilled version of DeepSeek Reasoner that sacrifices some of its deep reasoning capabilities.
        Although it can’t handle highly complex tasks in science, coding, or math, it still outperforms some competitors in general conversation.
        Suitable for everyday chat and light tasks.`
    },
    {
      modelName: 'gpt-4.0',
      modelDescription: `OpenAI's flagship GPT-4 model, known for its advanced natural language understanding,
        creative text generation, and strong reasoning abilities. It supports multimodal inputs and performs well on diverse,
        complex tasks from coding to professional-level benchmarks, while still occasionally producing hallucinated details.`
    },
    {
      modelName: 'claude-3-5-sonnet-latest',
      modelDescription: `Anthropic's Claude 3.5 Sonnet (Latest) is an improved conversational AI model that balances speed and thoughtful responses.
        It offers enhanced coding, reasoning, and creative writing capabilities compared to earlier versions,
        making it well-suited for everyday tasks and general-purpose applications where efficiency is key.`
    },
    {
      modelName: 'claude-3-7-sonnet-20250219',
      modelDescription: `Anthropic's Claude 3.7 Sonnet (20250219) is a hybrid reasoning model with adjustable extended thinking.
        It allows users to toggle between rapid responses and in-depth, step-by-step analysis,
        excelling in complex coding, strategic problem-solving, and creative content generation, although it may sometimes overthink simple queries.`
    }
  ];

const systemPrompt = `
    You are an AI assistant designed to analyze user prompts and determine the most suitable AI model to handle them effectively. 

    ### **Your Role:**
    1. **Model Selection:**  
    - Your task is to evaluate the user's prompt and select the best AI model from the available list.
    - Each model has specific strengths, such as coding, general knowledge, reasoning, or web access.
    - Refer to the provided descriptions to make an informed decision.

    ### **Guidelines:**
    - **Only return the model name in JSON format.**
    - **Do not provide explanations or additional text.**
    - **Ensure the model selection aligns with the provided descriptions.**

    ### **Available AI Models (JSON Format):**
    ${JSON.stringify(availableModels, null, 2)}
`;


export const handleRequest = async ({ 
    prompt ,
    chatId ,
    userId ,
    firstRequest ,
    expressResponse,
    model
 } : HandleRequestProps ) => {
    try{
        
        const initResponse = await initalizeChat({ chatId , prompt , userId , model , firstRequest });
        if(!initResponse || initResponse === null) return null;

        const askRequestProps = {
            prompt : prompt,
            messageId : initResponse.message.id,
            chatId : chatId,
            expressResponse : expressResponse,
            pastMessages : initResponse.pastMessages
        }

        const models = initializeModel();

        
        const attemptModelRequest = async (model : LanguageModelV1 , modelName : ModelType , ) => {
            try{
                const success = await getResponseUsingLLM({ ...askRequestProps , model , modelName })
                if(success) return true;
                else return false;
            }catch(err){
                console.error(`Error with model ${modelName}:`, err);
                return false;
            }
        }

        expressResponse.write(`data: ${JSON.stringify({ type: "messageId", content: initResponse.message.id })}\n\n`);

        const modelsToTry : { model : LanguageModelV1 , modelName : ModelType }[] = [
            { model : models.geminiProModel , modelName : 'gemini-2.0-pro-exp-02-05' },
            { model : models.geminiThinkingModel , modelName : 'gemini-2.0-flash-thinking-exp-01-21' },
            { model : models.geminiModel , modelName : 'gemini-2.0-flash-001' },
            { model : models.deepseekChatModel , modelName : 'deepseek-chat' },
            { model : models.deepseekReasoningModel , modelName : 'deepseek-reasoner' },
            { model : models.GPT4Model , modelName : 'gpt-4.0' },
            { model : models.claude35Sonnet , modelName : 'claude-3-5-sonnet-latest' },
            { model : models.claude37Sonnet , modelName : 'claude-3-7-sonnet-20250219' }
        ]

        const initalModelToTry = modelsToTry.find((m) => m.modelName === initResponse.modelName) || modelsToTry[0];
        var success = await attemptModelRequest(initalModelToTry.model , initalModelToTry.modelName);

        if(!success){
            for (const modelConfig of modelsToTry) {
                if (modelConfig.modelName === initalModelToTry.modelName) continue;
                success = await attemptModelRequest(modelConfig.model, modelConfig.modelName as ModelType);
                if (success) break;
            }
        }

        if(!success) return false;
        else return true;
    }catch(err){
        console.log("An error occured while handling request : " , err);
        return false;
    }
}

const getResponseUsingLLM = async({
    messageId,
    chatId,
    expressResponse,
    pastMessages,
    model,
    modelName
} : GetResponseProps) => {
    try{
        const startTime = performance.now();
        var success = true;

        const stream = streamText({
            model : model,
            messages : pastMessages,
            onChunk({ chunk }){
                if(chunk.type === 'reasoning'){
                    expressResponse.write(`data: ${JSON.stringify({ type: 'reasoning', content: chunk.textDelta })}\n\n`);
                }
                else if(chunk.type === 'text-delta'){
                    expressResponse.write(`data: ${JSON.stringify({ type: 'response', content: chunk.textDelta })}\n\n`);
                }
                else if(chunk.type === 'source'){
                    expressResponse.write(`data: ${JSON.stringify({ type: 'source', content: chunk.source })}\n\n`);
                }
            },
            onFinish : async ({ finishReason , reasoning , text , usage }) => {
                const endTime = performance.now();
                const responseTime = endTime - startTime;

                const details = { 
                    finishReason , 
                    totalTokens : usage.totalTokens , 
                    completionTokens : usage.completionTokens , 
                    promptTokens : usage.promptTokens ,
                    modelUsed : modelName,
                    responseTime : responseTime
                };
                
                expressResponse.write(`data: ${JSON.stringify({ type: 'details', content : details })}\n\n`);

                await storeMessageResponse({
                    messageId : messageId,
                    content : text,
                    modelName : modelName,
                    chatId : chatId,
                    finishReason : finishReason,
                    reasoning : reasoning ?? null,
                    completionTokens : usage.completionTokens,
                    promptTokens : usage.promptTokens,
                    totalTokens : usage.totalTokens,
                    responseTime : responseTime
                });
            },
            onError : ({ error }) => {
                console.log("An error occured while generating response : " , error);
                expressResponse.write(`data: ${JSON.stringify({ type: 'error', content : "An error occured" , modelName : modelName })}\n\n`);
                success = false;
            }
        });
       
        let fullResponse = "";
        let fullReasoning = "";

        for await (const delta of stream.textStream){
            fullResponse += delta;
        }

        if(!success) return false;
        return true;
    }catch(err){    
        console.log("An error occured while fetching response using llm : " , err);
        return false;
    }
}

const initalizeChat = async ({
    chatId ,
    prompt ,
    model , 
    firstRequest
} : InitializeChatProps) => {
    try{
        const gemini = createGoogleGenerativeAI({ apiKey : process.env.GEMINI_KEY });
        var modelName = model;
        var message = null;
        var chat = null;

        const pastConversation = await getLastChats(chatId);
        const pastMessages : CoreMessage[] = convertChatsToCoreMessages(pastConversation);
        pastMessages.push({ role : 'user' , content : prompt });
        console.log("size of past chats : " , pastMessages.length);

        if(firstRequest){
            const response = await generateObject({
                model : gemini('gemini-1.5-flash'),
                schema : z.object({ chatName : z.string() }),
                system : `You are an assistant whose job is just to create a chat name on the basis of the user's prompt. Make sure the chat name is relevant to the
                        user's prompt and keep it short, concise and professional.`,
                prompt : prompt,
            });

            const chatName = response.object['chatName'];
            chat = await updateChatName(chatId , chatName);
        }

        if(model === 'auto'){
            const response = await generateObject({
                model : gemini('gemini-2.0-flash-exp'),
                schema : z.object({ modelName : z.string() }),
                system : systemPrompt,
                messages : pastMessages
            });
            modelName = response.object['modelName'] as ModelType;
        }

        message = await storeUserPrompt(chatId , prompt , modelName);
        if(!message || message === null) return null;

        return {
            chatId : chatId,
            modelName : modelName,
            message : message,
            pastMessages : pastMessages
        }

    }catch(err){
        console.log("An error occured while initalizing chat : " , err);
        return null;
    }
}

const initializeModel = () => {
    const createGoogleModel = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_KEY });
    const geminiModel = createGoogleModel('gemini-2.0-flash-001');
    const geminiProModel = createGoogleModel('gemini-2.0-pro-exp-02-05');
    const geminiThinkingModel = createGoogleModel('gemini-2.0-flash-thinking-exp-01-21')

    const createDeepseekModel = createDeepSeek({ apiKey: process.env.DEEPSEEK_KEY });
    const deepseekReasoningModel = createDeepseekModel('deepseek-reasoner');
    const deepseekChatModel = createDeepseekModel('deepseek-chat');

    const createOpenAIModel = createOpenAI({ apiKey: process.env.OPENAI_KEY || '' });
    const GPT4Model = createOpenAIModel('gpt-4.5-preview-2025-02-27');

    const createAnthropicModel = createAnthropic({ apiKey : process.env.ANTHROPIC_KEY || '' });
    const claude35Sonnet = createAnthropicModel('claude-3-5-sonnet-latest');
    const claude37Sonnet = createAnthropicModel('claude-3-7-sonnet-20250219');

    return {
        geminiModel,
        geminiProModel,
        geminiThinkingModel,
        deepseekChatModel,
        deepseekReasoningModel,
        GPT4Model,
        claude35Sonnet,
        claude37Sonnet
    }
}