import { Message } from "@/types/next-auth-extensions";
import React from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Button } from "./ui/button";
import { BadgeInfo, CheckCheck, Copy, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { modelList } from "@/lib/available-models";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger , DropdownMenuItem } from "./ui/dropdown-menu";
import { memo } from "react";


type UsageDropdownProps = {
    message: Message;
};

type ChatMessageProps = {
    message: Message;
    isLast: boolean;
    onDeleteClicked: (id: string) => void;
};

const ChatMessage = ({ message , isLast, onDeleteClicked ,} : ChatMessageProps ) => {

    const [responseCopied , setResponseCopied] = useState<boolean>(false);
    const divRef = useRef<HTMLDivElement | null>(null);
    const currentModel = modelList.find((item) => item.modelId === message?.modelName);

    const handleCopyButtonClicked = async () => {
        if(message.response) {
            setResponseCopied(true);
            await navigator.clipboard.writeText(message.response);
        }
    }

    useEffect(() => {
        const handleClickOutside = (event : any) => {
            if(divRef.current && !divRef.current.contains(event.target)){
                setResponseCopied(false);
            }
        }

        window.addEventListener('click' , handleClickOutside);

        () => window.addEventListener('click' , handleClickOutside);
    }, []);

    return (
        <div ref={divRef} className="w-full flex flex-col justify-start group">
            <div className="w-full flex items-center justify-end">
                <div className="max-w-[70%] rounded-2xl bg-accent h-fit p-4 text-accent-foreground">
                    {message.prompt}
                </div>
            </div>

            {
              (message.error && (!message.response || message.response.length === 0)) && 
                <div className="w-fit px-4 pt-2 mt-4 rounded-lg border bg-red-950">
                    <MarkdownRenderer 
                      key={`error-${message.id}`}
                      content={message.error || ''} 
                      className="overflow-auto text-foreground font-semibold text-sm" 
                    />
                </div>
            }

            {message.response && 
                <div className="w-full mt-4 text-foreground">
                    <MarkdownRenderer 
                      key={`markdown-${message.id}`}
                      content={message.response || ''} 
                      className="overflow-auto text-foreground" 
                    />
                </div>
            }
            {  
                <div 
                    className={`
                        ${(isLast && message.totalTokens) ? 'visible' : 'invisible'} transition-all duration-400 ease-in-out w-full 
                        flex items-center justify-between ${message.totalTokens && 'group-hover:visible'}
                    `}>
                    <div className="w-fit flex items-center justify-start gap-1">
                        <Button
                            onClick={handleCopyButtonClicked}
                            size={'icon'} 
                            className="w-8 h-8 rounded-full bg-transparent shadow-transparent hover:bg-sidebar-border cursor-pointer"
                        >
                            { responseCopied ? <CheckCheck className="w-6 h-6 text-muted-foreground" /> : <Copy className='w-6 h-6 text-muted-foreground'/> }
                        </Button>
 
                        <Button
                            onClick={(e) => {
                              e.preventDefault();
                              onDeleteClicked(message?.id || "")
                            }}
                            className="w-8 h-8 rounded-full bg-transparent shadow-transparent hover:bg-sidebar-border cursor-pointer"
                        >
                            <Trash className="w-10 h-10 text-muted-foreground "/>
                        </Button>

                        
                        <UsageDropdown message={message} />
                    </div>

                    <div className="text-sm text-muted-foreground">
                        generated with {currentModel ? currentModel.modelName : message.modelName}
                    </div>
                </div>
            }
        </div>
    );
}  

const UsageDropdown: React.FC<UsageDropdownProps> = React.memo(({ message }) => {
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);

  return (
    <DropdownMenu open={isUsageModalOpen} onOpenChange={setIsUsageModalOpen}>
      <DropdownMenuTrigger asChild>
        <div
          onMouseEnter={() => setIsUsageModalOpen(true)}
          onMouseLeave={() => setIsUsageModalOpen(false)}
          className="w-8 h-8 rounded-full bg-transparent hover:bg-sidebar-border cursor-pointer flex items-center justify-center"
        >
          <BadgeInfo className="w-5 h-5 text-muted-foreground" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>
          <div className="w-fit flex flex-col items-start">
            <div className="flex text-sm text-muted-foreground justify-center items-center gap-1">
              <span>Finish reason: </span>
              <span>{message.finishReason}</span>
            </div>
            <div className="flex text-sm text-muted-foreground justify-start items-center gap-2">
              <span>Response time: </span>
              <span>{`${Math.ceil(message.responseTime || 0)} ms`}</span>
            </div>
            <div className="flex text-sm text-muted-foreground justify-start items-center gap-2">
              <span>Total tokens: </span>
              <span>{message.totalTokens}</span>
            </div>
            <div className="flex text-sm text-muted-foreground justify-start items-center gap-2">
              <span>Prompt tokens: </span>
              <span>{message.promptTokens}</span>
            </div>
            <div className="flex text-sm text-muted-foreground justify-start items-center gap-2">
              <span>Completion tokens: </span>
              <span>{message.completionTokens}</span>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});


export default memo(ChatMessage, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.response === nextProps.message.response &&
    prevProps.isLast === nextProps.isLast && 
    JSON.stringify(prevProps.message) === JSON.stringify(nextProps.message)
  )
})

