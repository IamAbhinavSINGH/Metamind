"use client"

import { ChatHistory } from '@/types/next-auth-extensions';
import axios from 'axios';
import { SessionContextValue, useSession } from 'next-auth/react';
import React , { createContext , Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';

interface ChatHistoryContextProps{
    chatHistory : ChatHistory[],
    refreshHistory : () => Promise<void>,
    setChatName : (chatId : string , chatName : string , lastUsedAt : number) => void
}

const initialValue : ChatHistoryContextProps = {
    chatHistory : [],
    refreshHistory : async () => {},
    setChatName : () => null
}

const ChatHistoryContext = createContext<ChatHistoryContextProps>(initialValue);

const fetchHistory = async (session : SessionContextValue , setChatHistory : Dispatch<SetStateAction<ChatHistory[]>>) => {
    if(session.status === 'unauthenticated' || !session.data) return;

    const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/chats`
    try{
        const response = await axios.get(url , {
            headers : { "Authorization" : `Bearer ${session.data.user.token}` }
        });
        if(response.status === 200 && response.data){
            setChatHistory([...response.data.chats.map((item : any) => {
                return { 
                    ...item ,
                    createdAt: new Date(item.createdAt),
                    lastUsedAt: new Date(item.lastUsedAt),
                };
            })])
        }
    }catch(err){
        console.log("An error occured while fetching chat history : " , err);
    }
}

const updateChatHistory = (
    chatId : string , 
    chatName : string , 
    lastUsedAt : number, 
    chatHistory : ChatHistory[] , 
    setChatHistory : Dispatch<SetStateAction<ChatHistory[]>>
) => {
    const updatedChat = chatHistory.find((item) => item.id === chatId);
    if(updatedChat === undefined) return; 
    
    const filteredHistory : ChatHistory[] = [...chatHistory.filter((item) => item.id !== chatId)];
    const updatedHistory = [...filteredHistory , {
        id : updatedChat.id,
        name : chatName,
        createdAt : updatedChat.createdAt,
        lastUsedAt : new Date(lastUsedAt)
    }];

    setChatHistory([...updatedHistory.sort((a,b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime())]);
}

export const ChatHistoryProvider = ({ children } : { children : React.ReactNode }) => {
    const [chatHistory , setChatHistory] = useState<ChatHistory[]>([]);
    const session = useSession();
    const refreshHistory = () => fetchHistory(session , setChatHistory);
    const setChatName = (chatId : string , chatName : string , lastUsedAt : number) => updateChatHistory(chatId , chatName , lastUsedAt , chatHistory , setChatHistory);

    useEffect(() => { fetchHistory(session , setChatHistory); }, []);

    return (
        <ChatHistoryContext.Provider value={{ chatHistory , refreshHistory , setChatName }}>
            {children}
        </ChatHistoryContext.Provider>
    )
}

export const useChatHistory = () => useContext(ChatHistoryContext);