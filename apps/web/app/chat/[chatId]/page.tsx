"use client"

import ChatRenderer from "@/components/ChatRenderer";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams , useRouter, useSearchParams } from "next/navigation";
import { useEffect , useState } from "react";
import { Message, MessageSource } from "@/types/next-auth-extensions";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import ChatInput from "@/components/ChatInput";
import React from "react";


export default function (){
    const params = useParams();
    const router = useRouter();
    const chatId = params?.chatId;
    const session = useSession();
    const searchParams = useSearchParams();
    const redirected = searchParams?.get("redirected") || null;
    const [messages , setMessages] = useState<Message[]>([]);
    const [isFalseChat , setIsFalseChat] = useState<boolean>(false);
    const [isLoading , setIsLoading] = useState<boolean>(false);

    const fetchChats = async () => {
        if(session.status !== 'authenticated' || !chatId) return;

        setIsFalseChat(false);
        if (messages.length === 0) setIsLoading(true);

        const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/chat/${chatId}`

        try{
            const response = await axios.get(url , {
                headers : { "Authorization" :  `Bearer ${session.data.user.token}` }
            })

            if(response.status === 200 && response.data.messages){
                const newMessages = response.data.messages;
                if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
                    setMessages([...newMessages.map((_message : Message) => {
                        return {
                            ..._message,
                            sources : _message?.sources?.map((_source : any) => {
                                return {
                                    sourceType : _source.sourceType || '',
                                    id : _source.sourceId || '',
                                    title : _source.title || '',
                                    url : _source.url || ''
                                } as MessageSource
                            })
                        }
                    })])
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
            <div className='w-full h-full flex flex-col pb-10 bg-accent'>
                <div className='flex-1 w-full h-full flex items-center justify-center'>
                    <ChatInput 
                        onPromptSubmit={() => {}}
                    />
                </div>
            </div>
        );
    }
    else if(isLoading){
        return (
            <div className='w-full h-full flex flex-col pb-10 bg-accent relative'>
                <div className='flex-1 w-full h-full flex items-center justify-center'>
                    <LoadingSpinner size="md"/>
                </div>
                <div className="sticky bottom-0 bg-accent">
                    <ChatInput
                        isLoading={isLoading}
                        onPromptSubmit={() => {}}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-accent">
            <ChatRenderer 
                refresh={fetchChats}
                messages={messages} 
                setMessages={setMessages}
                chatId={chatId}
            />
        </div>
    );
};