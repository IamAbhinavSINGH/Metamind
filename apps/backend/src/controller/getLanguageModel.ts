import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { ModelType } from "@repo/types";
import { LanguageModelV1 } from "ai";


export const initializeModel = (isSearchEnabled : boolean) => {
    const createGoogleModel = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_KEY });

    const geminiModel = createGoogleModel('gemini-2.0-flash-001' , { useSearchGrounding : isSearchEnabled});
    const gemini25Preview = createGoogleModel('gemini-2.5-flash-preview-04-17' , { useSearchGrounding : isSearchEnabled });
    const geminiThinkingModel = createGoogleModel('gemini-2.5-pro-exp-03-25' , { useSearchGrounding : isSearchEnabled });
    const googleImageGen = createGoogleModel('gemini-2.0-flash-exp' , { useSearchGrounding : isSearchEnabled });

    const createDeepseekModel = createDeepSeek({ apiKey: process.env.DEEPSEEK_KEY });

    const deepseekReasoningModel = createDeepseekModel('deepseek-reasoner');
    const deepseekChatModel = createDeepseekModel('deepseek-chat');

    const createOpenAIModel = createOpenAI({ apiKey: process.env.OPENAI_KEY || '' });
    const GPT4Model = createOpenAIModel('gpt-4.5-preview-2025-02-27');

    const createAnthropicModel = createAnthropic({ apiKey : process.env.ANTHROPIC_KEY || '' });
    const claude35Sonnet = createAnthropicModel('claude-3-5-sonnet-latest');
    const claude37Sonnet = createAnthropicModel('claude-3-7-sonnet-20250219');

    const modelsToTry : { model : LanguageModelV1 , modelName : ModelType }[] = [
        { model : geminiModel , modelName : 'gemini-2.0-flash-001' },
        { model : gemini25Preview , modelName : 'gemini-2.5-flash-preview-04-17' },
        { model : geminiThinkingModel , modelName : 'gemini-2.5-pro-exp-03-25' },
        { model : googleImageGen , modelName : 'gemini-2.0-flash-exp' },
        { model : deepseekChatModel , modelName : 'deepseek-chat' },
        { model : deepseekReasoningModel , modelName : 'deepseek-reasoner' },
        { model : GPT4Model , modelName : 'gpt-4.0' },
        { model : claude35Sonnet , modelName : 'claude-3-5-sonnet-latest' },
        { model : claude37Sonnet , modelName : 'claude-3-7-sonnet-20250219' }
    ]

    return { modelsToTry }
}