import React, { useEffect, useRef , useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput, { PromptSubmitProps } from "./ChatInput";
import { Message } from "@/types/next-auth-extensions";
import { useSession } from "next-auth/react";
import { LoadingIndicator } from "./LoadingSpinner";
import { modelList } from "@/lib/available-models";
import axios from "axios";
import { ModelType } from "@repo/types";
import { submitPrompt } from "@/lib/getResponse";
import { useMessageParser } from "@/lib/useMessageParser";


const ChatRenderer = ({ messages, setMessages, chatId, refresh, initialModel }: { 
  messages: Message[] ,
  initialModel : ModelType,
  setMessages : React.Dispatch<React.SetStateAction<Message[]>>, 
  chatId : string , 
  refresh : () => void 
}) => {

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading , setIsLoading] = useState<boolean>(false);
  const session = useSession();
  const { parseStream } = useMessageParser({ setIsLoading , setMessages });

  const handleChatInput = async (props : PromptSubmitProps) => {
    const { prompt  , selectedModel, files , isSearchEnabled  } = props;

    if(!prompt || prompt.length === 0 || !session.data) return;
    const model = selectedModel.modelId as ModelType;

    await submitPrompt({
      setMessages,
      messages,
      prompt,
      selectedModel : model,
      setIsLoading,
      isRedirected : false,
      session,
      chatId,
      parseStream,
      attachments : files,
      isSearchEnabled
    })
  };

  const handleMessageDelete = async (messageId : string) => {
    try{
      if(!session.data || !messageId) return;
      const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/message`;

      const response = await axios.delete(url , {
        params : { messageId : messageId , chatId : chatId },
        headers : { "Authorization" : `Bearer ${session.data?.user.token}` }
      });

      if(response.status === 200) refresh();
      else  alert("Could not delete the message!!");

    }catch(err){
      console.log("An error occured while deleting the message : " , err);
      alert("Could not delete the message!!");
    }
  }

  useEffect(() => {
    const getResponseforFirstMessage = async () => {
      if(messages.length === 0 || !session.data || messages.length > 1) return;
      if(messages[0]?.response && messages[0]?.response.length > 0) return;

      const prompt = messages[0]?.prompt;
      const model = messages[0]?.modelName as ModelType || 'auto';
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
        isSearchEnabled :false
      })
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
    // mutation observer to detect changes in the chat container
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
                onDeleteClicked={handleMessageDelete} 
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
          modelList={modelList}
          initialModel={modelList.find((item) => item.modelId === initialModel) || modelList[0]!} 
          onPromptSubmit={handleChatInput}
          onModelChange={handleModelChange}
        />
      </div>
    </div>
  );
  
};

export default ChatRenderer;