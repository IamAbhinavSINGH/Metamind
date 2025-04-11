import ChatInput from '@/components/ChatInput';
import React from 'react';
import { ModelType } from '@repo/types/src/types/chat'
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { modelList, ModelSchema } from '@/lib/available-models';

interface ChatInitializationProps {
    initialModel: ModelType;
    onModelChange : (model : string) => void
}

const ChatInitialization = ({ initialModel , onModelChange } : ChatInitializationProps) => {
    const session = useSession();
    const router = useRouter();

    const handleSubmit = async(prompt : string , selectedModel : ModelSchema , files : File[] | undefined) => {
        try{
            const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/chat/create`;
            const response = await axios.post(url , { prompt , modelName : selectedModel.modelId } , {
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
    }

    return (
        <div className='w-full h-full flex-1 flex flex-col pb-10'>
            <div className='flex-1 w-full h-full flex items-center justify-center'>
                <ChatInput 
                    modelList={modelList}
                    initialModel={modelList.find((item) => item.modelId === initialModel) || modelList[0]!} 
                    onPromptSubmit={handleSubmit} 
                    onModelChange={onModelChange}
                />
            </div>
        </div>
    );
}

export default ChatInitialization;