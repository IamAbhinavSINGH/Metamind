import { ModelType } from './index';

export enum Feature {
  Reasoning = 'reasoning',
  Search = 'search',
  Image = 'image',
  Video = 'video',
}

export interface ModelFeature{
    featureName: Feature,
    featureDescription: string,
    isAvailable: boolean,
}

const Features = {
  Reasoning: {
    featureName: Feature.Reasoning,
    featureDescription: "Supports complex reasoning tasks",
    isAvailable: true,
  },
  Search: {
    featureName: Feature.Search,
    featureDescription: "Can perform web searches",
    isAvailable: true,
  },
  Image: {
    featureName: Feature.Image,
    featureDescription: "Handles image inputs",
    isAvailable: true,
  },
  Video: {
    featureName: Feature.Video,
    featureDescription: "Handles video inputs",
    isAvailable: true,
  },
} as const;

export interface ModelSchema {
    modelName : string,
    modelId : ModelType,
    modelDescription : string,
    features : ModelFeature[],
}

export const ModelList: ModelSchema[] = [
    {
      modelName: 'Auto',
      modelId: 'auto',
      modelDescription: 'Automatically selects best model',
      features: [Features.Reasoning , Features.Search, Features.Image]  
      
    },
    {
      modelName: 'Gemini 2.0 Flash',
      modelId: 'gemini-2.0-flash-001',
      modelDescription: 'General purpose tasks',
      features: [Features.Search, Features.Image]
    },
    {
      modelName: 'Gemini 2.5 Flash Preview',
      modelId: 'gemini-2.5-flash-preview-04-17',
      modelDescription: 'Enhanced reasoning',
      features: [Features.Reasoning , Features.Search, Features.Image]
    },
    {
      modelName: 'Gemini 2.5 Pro',
      modelId: 'gemini-2.5-pro-exp-03-25',
      modelDescription: 'Day-to-day performance',
      features: [Features.Reasoning , Features.Search]
    },
    {
      modelName: 'Deepseek Reasoning',
      modelId: 'deepseek-reasoner',
      modelDescription: 'Complex coding & math',
      features: [Features.Reasoning]
    },
    {
      modelName: 'Deepseek Chat',
      modelId: 'deepseek-chat',
      modelDescription: 'Everyday conversation',
      features: []
    },
    {
      modelName: 'Claude 3.5 Sonnet',
      modelId: 'claude-3-5-sonnet-latest',
      modelDescription: 'Balanced, efficient AI',
      features: [Features.Reasoning]
    },
    {
      modelName: 'Claude 3.7 Sonnet',
      modelId: 'claude-3-7-sonnet-20250219',
      modelDescription: 'Hybrid reasoning with extended thinking',
      features: [Features.Reasoning, Features.Search, Features.Image]
    },
    {
        modelName : 'GPT-4.0',
        modelId : 'gpt-4.0',
        modelDescription : 'Advanced reasoning and coding',
        features : [Features.Reasoning, Features.Search]
    },
  ];
  