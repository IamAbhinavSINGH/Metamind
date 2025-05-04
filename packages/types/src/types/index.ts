import { z } from 'zod';

export const AI_MODELS = [
    "auto",
    'gemini-2.0-flash-001',
    'gemini-2.0-pro-exp-02-05',
    "gemini-2.0-flash-thinking-exp-01-21",
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

export const chatSchema = z.object({
  chatId : z.string(),
  prompt : z.string(),
  redirected : z.boolean().optional(),
  attachments : z.array(attachmentModel).optional()
});
