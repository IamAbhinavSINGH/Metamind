import ChatInput, { FileMetaData, PromptSubmitProps } from '@/components/ChatInput';
import React , { useState } from 'react';
import { ModelType } from '@repo/types'
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { modelList, ModelSchema } from '@/lib/available-models';
import { Attachment } from '@/lib/getResponse';

interface CreateChatRequestBody{
    prompt : string,
    modelName : string,
    attachments? : Attachment[]
}

interface ChatInitializationProps {
    initialModel: ModelType;
    onModelChange : (model : string) => void
}

const ChatInitialization = ({ initialModel , onModelChange } : ChatInitializationProps) => {
    const session = useSession();
    const router = useRouter();
    const [isLoading , setIsLoading] = useState<boolean>(false);

    const handleSubmit = async(props : PromptSubmitProps) => {
        const { prompt , selectedModel , files } = props;
        try{
            setIsLoading(true);
            const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/chat/create`;
            const dataToSend : CreateChatRequestBody  = {
                prompt : prompt,
                modelName : selectedModel.modelId,
            }

            if(files && files.length > 0){
                dataToSend.attachments = files.map((file) =>  {
                    return {
                        fileName : file.file.name,
                        fileType : file.file.type,
                        fileSize : file.file.size.toString(),
                        fileId : file.fileId || '',
                        fileKey : file.objectKey || ''
                    };
                });
            }

            const response = await axios.post(url , dataToSend , {
                headers : {
                    "Authorization" : `Bearer ${session.data?.user.token}`
                }
            }); 
            const chatId = response.data.chatId;

            if(response.status === 200 && response.data){
                router.push(`/chat/${chatId}?redirected=true&model=${selectedModel.modelId}`);
            }

        }catch(err){
            console.log("An error has occured while initalizing a chat : " , err);
        }
        finally { setIsLoading(false); }
    }

    return (
        <div className='w-full h-full flex-1 flex flex-col pb-10'>
            <div className='flex-1 w-full h-full flex items-center justify-center'>
                <ChatInput 
                    modelList={modelList}
                    initialModel={modelList.find((item) => item.modelId === initialModel) || modelList[0]!} 
                    onPromptSubmit={handleSubmit} 
                    onModelChange={onModelChange}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}

export default ChatInitialization;