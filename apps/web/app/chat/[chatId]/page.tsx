"use client"

import ChatRenderer from "@/components/ChatRenderer";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams , useRouter, useSearchParams } from "next/navigation";
import { useEffect , useState } from "react";
import { Message } from "@/types/next-auth-extensions";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import ChatInput from "@/components/ChatInput";
import { modelList } from "@/lib/available-models";
import React from "react";
import { ModelType } from "@repo/types";


export default function (){
    const params = useParams();
    const router = useRouter();
    const chatId = params?.chatId;
    const session = useSession();
    const searchParams = useSearchParams();
    const redirected = searchParams?.get("redirected") || null;
    const initialModel = searchParams?.get("model") as ModelType || modelList[0];
    const [messages , setMessages] = useState<Message[]>([]);
    const [isFalseChat , setIsFalseChat] = useState<boolean>(false);
    const [isLoading , setIsLoading] = useState<boolean>(false);

    const fetchChats = async () => {
        if(session.status !== 'authenticated' || !chatId) return;

        setIsFalseChat(false);
        if (messages.length === 0) setIsLoading(true)
        else return;

        const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/chat/${chatId}`

        try{
            const response = await axios.get(url , {
                headers : { "Authorization" :  `Bearer ${session.data.user.token}` }
            })

            if(response.status === 200 && response.data.messages){
                const newMessages = response.data.messages;
                // Only update if messages have changed
                if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
                    setMessages([...newMessages])
                }
            }

            setIsLoading(false);
        }catch(err : any){
            setIsLoading(false);
            if(err.response?.status === 500)setIsFalseChat(true);
        }
    }

    useEffect(() => {
        // Only fetch if session is authenticated and we don't have messages yet
        if (session.status === "authenticated" && messages.length === 0) {
            fetchChats()
        }
    }, [session.status])

    useEffect(() => {
        if(session.status === 'unauthenticated'){
            router.push("/auth/login");
        }
    }, [session]);

    useEffect(() => {
        if(!isLoading && isFalseChat){
            router.push('/chat?model=auto');
            return;
        }
    }, [isFalseChat]);

    if(!chatId || chatId === null || Array.isArray(chatId)){
        router.push("/chat?model=auto");
        return;
    }

    if(isLoading && (redirected && redirected === "true")){
        return (
            <div className='w-full h-full flex flex-col pb-10 bg-sidebar'>
                <div className='flex-1 w-full h-full flex items-center justify-center'>
                    <ChatInput 
                        modelList={modelList}
                        initialModel={modelList.find((item) => item.modelId === initialModel) || modelList[0]!} 
                        onPromptSubmit={() => {}}
                    />
                </div>
            </div>
        );
    }
    else if(isLoading){
        return (
            <div className='w-full h-full flex flex-col pb-10 bg-sidebar relative'>
                <div className='flex-1 w-full h-full flex items-center justify-center'>
                    <LoadingSpinner size="md"/>
                </div>
                <div className="sticky bottom-0 bg-sidebar">
                    <ChatInput
                        initialModel={modelList.find((item) => item.modelId === initialModel) || modelList[0]!} 
                        modelList={modelList}
                        isLoading={isLoading}
                        onPromptSubmit={() => {}}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 md:px-8 lg:px-12 h-screen bg-sidebar-accent">
            <ChatRenderer 
                refresh={fetchChats}
                messages={messages} 
                setMessages={setMessages}
                chatId={chatId}
                initialModel={initialModel}
            />
        </div>
    );
};