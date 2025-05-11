
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
      modelName: 'gemini-2.5-flash-preview-04-17',
      modelDescription: `A day-to-day model by Google that improves upon the general Gemini-2.0 in coding, math, and complex tasks.
        It is less focused on introspective "thinking" and more on delivering quick, accurate responses.`
    },
    {
      modelName: 'gemini-2.5-pro-exp-03-25',
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

export const systemPrompt = `
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