import { ModelType } from "@repo/types";

export interface ModelSchema {
    modelName : string,
    modelId : ModelType,
    modelDescription : string
}


export const modelList: ModelSchema[] = [
    {
      modelName: 'Auto',
      modelId: 'auto',
      modelDescription: 'Automatically selects best model'
    },
    {
      modelName: 'Gemini 2.0 Flash',
      modelId: 'gemini-2.0-flash-001',
      modelDescription: 'General purpose tasks'
    },
    {
      modelName: 'Gemini 2.5 Flash Preview',
      modelId: 'gemini-2.5-flash-preview-04-17',
      modelDescription: 'Enhanced reasoning'
    },
    {
      modelName: 'Gemini 2.5 Pro',
      modelId: 'gemini-2.5-pro-exp-03-25',
      modelDescription: 'Day-to-day performance'
    },
    {
      modelName: 'Deepseek Reasoning',
      modelId: 'deepseek-reasoner',
      modelDescription: 'Complex coding & math'
    },
    {
      modelName: 'Deepseek Chat',
      modelId: 'deepseek-chat',
      modelDescription: 'Everyday conversation'
    },
    {
      modelName: 'Claude 3.5 Sonnet',
      modelId: 'claude-3-5-sonnet-latest',
      modelDescription: 'Balanced, efficient AI'
    },
    {
      modelName: 'Claude 3.7 Sonnet',
      modelId: 'claude-3-7-sonnet-20250219',
      modelDescription: 'Hybrid reasoning with extended thinking'
    }
  ];
  