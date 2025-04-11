import React, { useEffect, useRef , useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Message } from "@/types/next-auth-extensions";
import { useSession } from "next-auth/react";
import { LoadingIndicator } from "./LoadingSpinner";
import { modelList, ModelSchema } from "@/lib/available-models";
import axios from "axios";
import { ModelType } from "@repo/types";
import { getResponse } from "@/lib/getResponse";
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

  const handleChatInput = async (prompt : string , selectedModel : ModelSchema , files : File[] | undefined) => {
    if(!prompt || prompt.length === 0 || !session.data) return;
    const model = selectedModel.modelId as ModelType;
    await getResponse({
      prompt : prompt,
      selectedModel : model,
      setMessages : setMessages,
      setIsLoading : setIsLoading,
      isRedirected : false,
      session : session,
      chatId : chatId,
      parseStream
    }); 
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

      await getResponse({
        prompt : prompt,
        selectedModel : model,
        setMessages : setMessages,
        setIsLoading : setIsLoading,
        isRedirected : true,
        session : session,
        chatId : chatId,
        parseStream
      });       
    }

    getResponseforFirstMessage();
  } , [session.status]);

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
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    })

    // Start observing the chat container for changes
    if (scrollRef.current) {
      observer.observe(scrollRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      })
    }

    return () => observer.disconnect()
  }, []);


  return (
    <div className="w-full max-w-3xl h-full flex flex-col mx-auto relative">
      {/* Scrollable pastMessages container */}
      <div
        ref={scrollRef}
        className="flex-1 pb-32 pt-10 overflow-y-scroll no-scrollbar p-4 flex flex-col gap-4"
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
          <div className="w-full flex items-center justify-start pt-10">
            <LoadingIndicator isLoading={isLoading} loadingText="Generating response" />
          </div>
        }
      </div>
      <div className="absolute top-0 left-0 w-full h-10 pointer-events-none bg-gradient-to-b from-sidebar to-transparent" />
      
      <div className="sticky bottom-0 bg-sidebar">
        <ChatInput
          isLoading={isLoading}
          modelList={modelList}
          initialModel={modelList.find((item) => item.modelId === initialModel) || modelList[0]!} 
          onPromptSubmit={handleChatInput}
        />
      </div>
    </div>
  );
  
};

export default ChatRenderer;