"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Paperclip, X, FileText, Image, Film, File, SendIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { DropdownMenu } from "./ui/dropdown-menu"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ModelSchema } from "@/lib/available-models"
import { LoadingSpinner } from "./LoadingSpinner"

interface ChatInputProps {
  modelList: ModelSchema[]
  initialModel : ModelSchema | null
  onPromptSubmit: (prompt: string , selectedModel : ModelSchema , files?: File[]) => void
  maxLength?: number,
  isLoading?: boolean,
  onModelChange? : (model : string) => void
}

export default function ChatInput({ modelList, initialModel , onPromptSubmit, maxLength = 4000 , isLoading , onModelChange }: ChatInputProps) {
  const [prompt, setPrompt] = useState<string>("")
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedModel , setSelectedModel] = useState<ModelSchema>(initialModel ? initialModel : modelList[0]!);

  // Auto-resize the textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const newHeight = Math.min(textareaRef.current.scrollHeight, 300)
      textareaRef.current.style.height = `${newHeight}px`
    }
  }, [prompt])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() === "" && files.length === 0) return
    onPromptSubmit(prompt, selectedModel , files.length > 0 ? files : undefined);
    setPrompt("")
    setFiles([]);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
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
    <div className="w-full flex flex-col">
      <div className="w-full max-w-3xl mx-auto bg-accent border-border rounded-3xl z-10 shadow">
        <form onSubmit={handleSubmit} className="py-1 px-4">
          {files.length > 0 && (
              <div className="mb-3">
                  <div className="text-sm text-muted-foreground mb-2">Attached files ({files.length})</div>
                  <div className="flex flex-wrap gap-1">
                  {files.map((file, index) => (
                      <div key={index} className="group relative hover:bg-border flex items-center gap-1 bg-muted p-2 rounded-md text-sm">
                        {getFilePreview(file) || (
                            <div className="flex items-center gap-1.5">
                            {getFileIcon(file)}
                              <span className="max-w-[150px] truncate">{file.name}</span>
                            </div>
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full opacity-70 cursor-pointer hover:opacity-100 hover:bg-transparent"
                            onClick={() => removeFile(index)}
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove file</span>
                        </Button>
                      </div>
                  ))}
                  </div>
              </div>
          )}
          <div className="flex flex-col">
              <div>
                  <ScrollArea
                      className={cn(
                      "w-full bg-accent px-3 py-2 mt-2",
                      "focus:outline-none"
                      )}
                  >
                      <textarea
                          ref={textareaRef}
                          className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base min-h-[30px]"
                          placeholder="Type your message..."
                          value={prompt}
                          onKeyDown={handleTextareaKeyDown}
                          onChange={(e) => {
                              if (maxLength && e.target.value.length > maxLength) return
                              setPrompt(e.target.value)
                          }}
                          rows={1}
                      />
                  </ScrollArea>
              </div>
              {/* <div className="w-full flex justify-end items-center">
                  <div className="text-xs text-muted-foreground mr-1">
                    {prompt.length > 0 && maxLength && (
                        <span> {prompt.length}/{maxLength} </span>
                    )}
                  </div>
              </div> */}
              <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
              <div className="w-full flex items-center justify-between gap-4 mt-2 mb-4">
                  <SelectModel 
                      modelList={modelList}
                      selectedModel={selectedModel}
                      setSelectedModel={handleModelChange}
                  />

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
                <Button className="border px-4 py-1 cursor-pointer">
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

