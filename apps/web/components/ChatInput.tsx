"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Paperclip, X, FileText, Image, Film, File, SendIcon, Globe, Sparkle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { DropdownMenu } from "./ui/dropdown-menu"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LoadingSpinner } from "./LoadingSpinner"
import axios from "axios"
import { useSession } from "next-auth/react"
import { ModelSchema , ModelList, ModelType } from "@repo/types"
import { useSearchParams } from "next/navigation"
import ModelSelectionModal from "./ModelSelection"

export interface PromptSubmitProps {
  prompt : string,
  selectedModel : ModelSchema,
  files? : FileMetaData[],
  isSearchEnabled : boolean,
  includeImage? : boolean,
  includeReasoning : boolean
}

interface ChatInputProps {
  onPromptSubmit: (props : PromptSubmitProps) => void
  isLoading?: boolean,
  onModelChange? : (model : string) => void
}

export interface FileMetaData{
  file : File,
  isLoading : boolean,
  uploadURL : string | null,
  objectKey : string | null,
  fileId : string | null
}


export default function ChatInput({ onPromptSubmit , isLoading , onModelChange }: ChatInputProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [files, setFiles] = useState<FileMetaData[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const initialModel = searchParams?.get("model") as ModelType || ModelList[0]?.modelId;
  const [selectedModel , setSelectedModel] = useState<ModelSchema>(ModelList.find((item) => item.modelId === initialModel)!);
  const [isSearchEnabled , setIsSearchEnabled] = useState<boolean>(false);
  const [includeImage , setIncludeImage] = useState<boolean>(false);
  const [includeReasoning , setIncludeReasoning] = useState<boolean>(false);
  const session = useSession();

  // Auto-resize the textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const newHeight = Math.min(textareaRef.current.scrollHeight, 250)
      textareaRef.current.style.height = `${newHeight}px`
    }
  }, [prompt]);

  useEffect(() => {
    const pendingFiles = files.filter(item => item.isLoading);
    if(pendingFiles.length === 0 || !session.data) return;

    const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/file`;
    const headers = { "Authorization" : `Bearer ${session.data.user.token}` };

    pendingFiles.forEach(async (_item) => {
      const dataToPost = { fileName : _item.file.name, fileSize : _item.file.size.toString() , fileType : _item.file.type };
      try{
        const response = await axios.post(url , dataToPost , { headers });

        if(response.status === 200 && response.data){
          _item.fileId = response.data.fileId;
          _item.uploadURL = response.data.url;
          _item.objectKey = response.data.key;

          const uploadResponse = await axios.put(_item.uploadURL! , _item.file , { headers : {
            "Content-Type" : _item.file.type
          }});
        }

      }catch(err){
        console.log("An error occured while fetching upload url : " , err);
      }
      finally{           
        _item.isLoading = false; 
      }
    });
  }, [files]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() === "" && files.length === 0) return
    onPromptSubmit({prompt, selectedModel , files , isSearchEnabled , includeImage , includeReasoning});
    setPrompt("")
    setFiles([]);
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [
        ...prev,
        ...newFiles.map((file) => {
          return {
            file : file,
            isLoading : true,
            uploadURL : null,
            objectKey : null,
            fileId : null
          } as FileMetaData
        })
      ]);
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleModelChange = (model : ModelSchema) => {
    setSelectedModel(model);
    if(onModelChange && onModelChange !== null){
      onModelChange(model.modelId);
    }
  }

  return (
    <div className="w-full bg-transparent flex flex-col px-4 md:px-6 lg:px-8">
      <div className="w-full max-w-3xl mx-auto bg-sidebar-border/80 border border-border rounded-3xl z-20 pt-1 px-4">
        <form onSubmit={handleSubmit} className="rounded-3xl">
          {files.length > 0 && (
              <div className="mb-2">
                  <div className="text-sm text-muted-foreground mt-1 pl-1 mb-2">Attached files ({files.length})</div>
                  <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                      <div key={index} className="group relative hover:bg-accent flex items-center gap-2 bg-muted p-2 rounded-md text-sm">
                        {getFilePreview(file.file) || (
                            <div className="flex items-center gap-1.5">
                            {getFileIcon(file.file)}
                              <span className="max-w-[150px] truncate">{file.file.name}</span>
                            </div>
                        )}
                        <button
                            className="h-4 w-4 rounded-full flex items-center justify-center bg-accent-foreground cursor-pointer hover:bg-accent-foreground"
                            onClick={() => removeFile(index)}
                        >
                            <X className="h-3 w-3 text-black" />
                            <span className="sr-only">Remove file</span>
                        </button>
                      </div>
                  ))}
                  </div>
              </div>
          )}
          <div className="flex flex-col">
              <div>
                  <ScrollArea
                      className={cn(
                      "w-full bg-transparent pt-2",
                      "focus:outline-none"
                      )}
                  >
                      <textarea
                        ref={textareaRef}
                        className="w-full min-h-10 transparent-scrollbar resize-none text-accent-foreground placeholder:text-muted-foreground focus:outline-none text-base"
                        placeholder="Ask anything"
                        value={prompt}
                        onKeyDown={handleTextareaKeyDown}
                        onChange={(e) => setPrompt(e.target.value) }
                        rows={1}
                      />
                  </ScrollArea>
              </div>
              <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
              <div className="w-full flex items-center justify-between gap-2 mb-2">
                  <ModelSelectionModal 
                      modelList={ModelList}
                      selectedModel={selectedModel}
                      setSelectedModel={handleModelChange}
                  />

                  <div className="w-full md:ml-4 flex items-center justify-start gap-1">
                      <SearchButton isSearchEnabled={isSearchEnabled} toggleSearch={(e) =>{
                          e.preventDefault();
                          setIsSearchEnabled((prev) => !prev) 
                        }}
                      />

                      <ReasoningButton includeReasoning={includeReasoning} toggleReasoning={(e) => {
                          e.preventDefault();
                          setIncludeReasoning((prev) => !prev);
                        }}
                      />
                  </div>

                  <div className="w-full flex items-end justify-end gap-2">
                      <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full cursor-pointer"
                          onClick={triggerFileInput}
                          >
                          <Paperclip className="h-4 w-4" />
                          <span className="sr-only">Attach files</span>
                      </Button>

                      <Button
                          type="submit"
                          size="icon"
                          className="h-10 w-10 rounded-full cursor-pointer"
                          disabled={prompt.trim() === "" && files.length === 0}
                          >
                          {
                            isLoading && isLoading === true ? 
                              <LoadingSpinner size="sm" /> 
                            :
                            <div>
                              <SendIcon className="h-4 w-4" />
                              <span className="sr-only">Send message</span>
                            </div>
                          }
                      </Button>
                  </div>
              </div>  
          </div>
        </form>
      </div>
      <div className="w-full">
          <p className="py-2 text-center text-xs text-muted-foreground">
            AI can make mistakes. Always verify outputs before use.
          </p>
      </div>
    </div>
  )
}

const SearchButton = ({ isSearchEnabled , toggleSearch } : { isSearchEnabled : boolean , toggleSearch : (e : any) => void }) => {

  return (
    <button 
      type="button"
      className={`w-fit h-fit cursor-pointer px-1 py-2 text-sm rounded-full transition-all duration-100 ease-in-out flex items-center justify-center group gap-1`}
      onClick={toggleSearch}
    >
      <Globe className={`w-4 h-4 ${isSearchEnabled ? 'text-sky-500' : 'text-primary'}`} />
      <span className={`hidden md:block ${isSearchEnabled ? 'text-sky-500 ' : 'text-primary'}`} >Search </span>
    </button>
  );

}

const ReasoningButton = ({ includeReasoning , toggleReasoning } : { includeReasoning : boolean , toggleReasoning : (e : any) => void }) => {
  return (
    <button 
      type="button"
      className={`w-fit h-fit cursor-pointer px-2 py-2 text-sm rounded-full duration-100 transition-all ease-in-out flex items-center justify-center group gap-1`}
      onClick={toggleReasoning}
    >
      <Sparkle className={`w-4 h-4 ${includeReasoning ? 'text-sky-500' : 'text-primary'}`} />
      <span className={`hidden md:block ${includeReasoning ? 'text-sky-500 ' : 'text-primary'}`} >Reasoning</span>
    </button>
  );
}

const SelectModel = ({ 
  modelList , 
  selectedModel , 
  setSelectedModel 
} : { 
  modelList : ModelSchema[] , 
  selectedModel : ModelSchema , 
  setSelectedModel : (model : ModelSchema) => void 
}) => {
    const [currentSelectedModel , setCurrrentSelectedModel] = useState<ModelSchema>(selectedModel);

    const handleModelChange = (index : number) => {
        if (modelList[index]) {
            setSelectedModel(modelList[index]);
            setCurrrentSelectedModel(modelList[index]);
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="px-5 py-0.5 text-sm cursor-pointer">
                    {currentSelectedModel.modelName}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="border-border rounded-md max-w-60 w-full my-2">
                {
                (modelList.length > 0) && 
                    modelList.map((model , index) => (
                        <DropdownMenuItem 
                          key={index} 
                          className={`flex flex-col items-start cursor-pointer my-2 ${currentSelectedModel.modelId === model.modelId && 'bg-muted' }`}
                          onSelect={() => handleModelChange(index)}
                        >
                            <div className="text-sm whitespace-nowrap">
                                {model.modelName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {model.modelDescription}
                            </div>
                        </DropdownMenuItem>
                    ))
                }
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const getFileIcon = (file: File) => {
  const type = file.type.split("/")[0]
  switch (type) {
    case "image":
      return <Image className="h-4 w-4" />
    case "video":
      return <Film className="h-4 w-4" />
    case "text":
      return <FileText className="h-4 w-4" />
    default:
      return <File className="h-4 w-4" />
  }
}

const getFilePreview = (file: File) => {
  if (file.type.startsWith("image/")) {
    return (
      <div className="relative h-16 w-16 rounded-md overflow-hidden">
        <img
          src={URL.createObjectURL(file) || "/placeholder.svg"}
          alt={file.name}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }
  return null
}

