import React, { useEffect, useRef , useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput, { PromptSubmitProps } from "./ChatInput";
import { Message } from "@/types/next-auth-extensions";
import { useSession } from "next-auth/react";
import { LoadingIndicator } from "./LoadingSpinner";
import { ModelType } from "@repo/types";
import { submitPrompt } from "@/lib/getResponse";
import { useMessageParser } from "@/lib/useMessageParser";


const ChatRenderer = ({ messages, setMessages, chatId, refresh }: { 
  messages: Message[] ,
  setMessages : React.Dispatch<React.SetStateAction<Message[]>>, 
  chatId : string , 
  refresh : () => void 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading , setIsLoading] = useState<boolean>(false);
  const session = useSession();
  const { parseStream } = useMessageParser({ setIsLoading , setMessages });

  const handleChatInput = async (props : PromptSubmitProps) => {
    const { prompt  , selectedModel, files , isSearchEnabled , includeImage , includeReasoning  } = props;

    if(!prompt || prompt.length === 0 || !session.data) return;
    const model = selectedModel.modelId as ModelType;

    await submitPrompt({
      setMessages : setMessages,
      messages : messages,
      prompt : prompt,
      selectedModel : model,
      setIsLoading : setIsLoading,
      isRedirected : false,
      session : session,
      chatId : chatId,
      parseStream : parseStream,
      attachments : files,
      isSearchEnabled : isSearchEnabled,
      includeImage : includeImage,
      includeReasoning : includeReasoning
    })
  };

  useEffect(() => {
    const getResponseforFirstMessage = async () => {
      if(messages.length === 0 || !session.data || messages.length > 1) return;
      if(messages[0]?.response && messages[0]?.response.length > 0) return;

      const prompt = messages[0]?.prompt;
      const model = messages[0]?.modelName as ModelType || 'auto';
      const includeSearch = messages[0]?.includeSearch || false;
      const includeImage = messages[0]?.includeImage || false; 
      const includeReasoning = messages[0]?.includeReasoning || false;
      if(!prompt || prompt.length === 0) return;

      await submitPrompt({
        setMessages,
        messages,
        selectedModel : model,
        setIsLoading,
        prompt,
        isRedirected : true,
        session,
        chatId,
        parseStream,
        attachments : messages[0]?.attachments || [],
        isSearchEnabled :includeSearch,
        includeImage : includeImage,
        includeReasoning : includeReasoning
      });
    }

    getResponseforFirstMessage();
  } , [session.status]);

  const handleModelChange = (model : string) => {
  }

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scroll({
          top : scrollRef.current.scrollHeight,
          behavior : 'smooth'
        })
      }
    }

    scrollToBottom()
  }, [messages, isLoading]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight 
    })

    if (scrollRef.current) {
      observer.observe(scrollRef.current, {
        childList: true,
        characterData: true,
      })
    }

    return () => observer.disconnect()
  }, []);


  return (
    <div className="w-full h-full flex flex-col relative bg-accent">
      {/* Scrollable pastMessages container */}
      <div
        ref={scrollRef} 
        className="flex-1 w-full pb-32 pt-10 transparent-scrollbar overflow-y-scroll flex flex-col"
      >
        {
          (messages && messages.length > 0) &&
            messages.map((message, index) => (
              <ChatMessage 
                key={index} 
                message={message}
                chatId={chatId}
                onDeleteClicked={() => refresh()} 
                isLast={index === messages.length-1}
              />
            ))
        }
        {
          isLoading && 
          <div className="w-full max-w-3xl px-4 md:px-6 mx-auto flex items-center justify-start">
            <LoadingIndicator isLoading={isLoading} loadingText="Generating response" />
          </div>
        }
      </div>
      <div className="absolute top-0 left-0 w-full h-10 pointer-events-none bg-gradient-to-b from-accent to-transparent" />
      
      <div className="w-full max-w-4xl mx-auto bg-accent sticky bottom-0">
        <ChatInput
          isLoading={isLoading}
          onPromptSubmit={handleChatInput}
          onModelChange={handleModelChange}
        />
      </div>
    </div>
  );
  
};

export default ChatRenderer;