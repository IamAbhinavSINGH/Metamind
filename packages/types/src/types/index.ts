import { z } from 'zod';

export const AI_MODELS = [
    "auto",
    'gemini-2.0-flash-001',
    "gemini-2.5-flash-preview-04-17",
    "gemini-2.5-pro-exp-03-25",
    "deepseek-chat",
    "deepseek-reasoner",
    "gpt-4.0",
    "claude-3-5-sonnet-latest",
    "claude-3-7-sonnet-20250219",
  ] as const;

export const ModelSchema = z.enum(AI_MODELS);
export type ModelType = z.infer<typeof ModelSchema>;

export const attachmentModel = z.object({
  fileName : z.string(),
  fileId : z.string(),
  fileType : z.string(),
  fileSize : z.string(),
  fileKey : z.string()
})

export const messageSchema = z.object({
  role : z.enum(['user' , 'assistant']),
  content : z.string(),
  attachments : z.array(attachmentModel).optional(),
  id : z.string().optional()
});

export const modelParamsSchema = z.object({
  includeSearch : z.boolean(),
  includeReasoning : z.boolean(),
})

export const chatSchema = z.object({
  messages : z.array(messageSchema),
  model : ModelSchema,
  chatId : z.string(),
  modelParams : modelParamsSchema,
  redirected : z.boolean()
});