import { Message, MessageSource } from "@/types/next-auth-extensions";
import React from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Button } from "./ui/button";
import { BadgeInfo, CheckCheck, Copy, ExternalLink, File, FileText, FileTextIcon, Film, Image, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { modelList } from "@/lib/available-models";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger , DropdownMenuItem } from "./ui/dropdown-menu";
import { memo } from "react";
import { Attachment } from "@/lib/getResponse";
import { SessionContextValue, useSession } from "next-auth/react";
import axios from "axios";
import MessageSources from "./MessageSource";


type UsageDropdownProps = {
    message: Message;
};

type ChatMessageProps = {
    message: Message;
    isLast: boolean;
    onDeleteClicked: (id: string) => void;
};

const ChatMessage = ({ message , isLast, onDeleteClicked ,} : ChatMessageProps ) => {
    const divRef = useRef<HTMLDivElement | null>(null);
    const currentModel = modelList.find((item) => item.modelId === message?.modelName);
    const [files , setFiles] = useState<{ attachment : Attachment, readURL : string }[]>([]);
    const session = useSession();

    useEffect(() => {
      const fetchURLs = async () => {
        if(message.attachments && message.attachments.length > 0){
          const results = await Promise.all(
            message.attachments.map(async (file) => {
              const url = await getReadURL(file , session);
              return url !== null ? { attachment: file, readURL: url } : null;
            })
          );
          const updatedList = results.filter(
            (item): item is { attachment: Attachment, readURL: string } => item !== null
          );
          setFiles(updatedList);
        }
      };
      fetchURLs();
    } , [message.attachments]);

    return (
        <div ref={divRef} className="w-full px-4 md:px-6  max-w-3xl mx-auto flex flex-col justify-start group">
            <div className="w-full flex flex-col gap-1 items-end justify-start">
              <div className="w-full max-w-[70%] flex flex-wrap items-center justify-end gap-2">
                {
                  (files && files.length > 0) && (
                    files.map((file) => (
                      file.attachment.fileType.startsWith('image/') ? 
                      <ImagePreviewer key={file.attachment.fileKey} file={file}/> : 
                      <FilePreviewer key={file.attachment.fileKey} file={file}/>
                    ))
                  )
                }
              </div>
              <div className="w-fit max-w-[70%] rounded-2xl bg-sidebar-border/70 p-4 h-fit text-accent-foreground">
                  <MarkdownRenderer content={message.prompt} className="text-foreground overflow-auto"/>
              </div>
            </div>

            {
              (message.error && (!message.response || message.response.length === 0)) && 
                <div className="w-fit px-4 mt-4 rounded-lg border bg-pink-900">
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

            {(message.sources && message.sources.length > 0) && <MessageSources sources={message.sources} />}

            {  
              <div className={` ${(isLast && message.finishReason) ? 'visible' : 'invisible'} transition-all duration-400 ease-in-out w-full 
                      flex items-center justify-between ${message.finishReason && 'group-hover:visible'} `}>
                  
                  <MessageInfoComponent message={message} onDeleteClicked={onDeleteClicked} />
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
              <span>{message.finishReason || '--'}</span>
            </div>
            <div className="flex text-sm text-muted-foreground justify-start items-center gap-2">
              <span>Response time: </span>
              <span>{`${Math.ceil(message.responseTime || 0)} ms`}</span>
            </div>
            <div className="flex text-sm text-muted-foreground justify-start items-center gap-2">
              <span>Total tokens: </span>
              <span>{message.totalTokens || '--'}</span>
            </div>
            <div className="flex text-sm text-muted-foreground justify-start items-center gap-2">
              <span>Prompt tokens: </span>
              <span>{message.promptTokens || '--'}</span>
            </div>
            <div className="flex text-sm text-muted-foreground justify-start items-center gap-2">
              <span>Completion tokens: </span>
              <span>{message.completionTokens || '--'}</span>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

const MessageInfoComponent = React.memo(({ message , onDeleteClicked } : { message : Message , onDeleteClicked: (id: string) => void }) => {
  const [responseCopied , setResponseCopied] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement | null>(null);
  const handleCopyButtonClicked = async () => {
      if(message.response) {
        setResponseCopied(true);
        await navigator.clipboard.writeText(message.response);
        setTimeout(() => setResponseCopied(false) , 1500);
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
    <div ref={divRef} className="w-fit flex items-center justify-start gap-1">
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
  );
});

const ImagePreviewer = ({ file } : { file : { attachment : Attachment , readURL : string } }) => {
  return (
    <div className="h-24 w-24 rounded-md bg-secondary-foreground">
        <img 
          className="w-full h-full rounded-md object-cover"
          src={file.readURL}
          loading="lazy"
        />
    </div>
  );
}

const downloadFile = async (file : { attachment: Attachment; readURL: string  }) => {
  try{
    // Fetch the file as a blob
    const response = await fetch(file.readURL);
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.download = file.attachment.fileName || "download";
    document.body.appendChild(link);
    link.click();
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

const FilePreviewer = ({ file }: { file: { attachment: Attachment; readURL: string } }) => {
  return (
    <button onClick={() => downloadFile(file)} className="w-fit h-14 flex items-center cursor-pointer rounded-xl gap-2 px-2 py-1 border border-sidebar-border">
      <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center">
        {getFileIcon(file.attachment.fileType , 'h-5 w-5')}
      </div>
      <div className="w-fit text-sm h-full mr-10 flex items-center justify-start text-foreground">
        {file.attachment.fileName}
      </div>
    </button>
  );
};

const getFileIcon = (fileType: string , className='') => {
  if(fileType.startsWith("image/")) return <Image className={`h-4 w-4 text-white ${className}`}/>
  else if(fileType.startsWith("video/")) return <Film className={`h-4 w-4 text-white ${className}`}/>
  else if(fileType.startsWith("text")) return <FileTextIcon className={`w-4 h-4 text-white ${className}`}/>
  else return <File className={`w-4 h-4 text-white ${className}`}/>
}

export default memo(ChatMessage, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.response === nextProps.message.response &&
    prevProps.isLast === nextProps.isLast && 
    JSON.stringify(prevProps.message) === JSON.stringify(nextProps.message)
  )
})

 const getReadURL = async (file : Attachment , session : SessionContextValue) => {
  if(!file || file === null || !session.data) return;

  const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/file/`;
  const headers = { Authorization : `Bearer ${session.data?.user.token}` };

  try{

    const response = await axios.get(url , { 
      headers ,
      params : { fileKey : file.fileKey }
    });
    if(response.status === 200 && response.data) return response.data.readURL;
    else return null;

  }catch(err){
    console.log("Failed to fetch read url : " , err);
    return null;
  }
}