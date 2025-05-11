"use client"

import React , { useState , useEffect } from "react";
import { Search, Sidebar, SquarePen, X } from "lucide-react";
import { useSidebar } from "@/lib/providers/SidebarContext";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { LoadingSpinner } from "./LoadingSpinner";
import { useChatHistory } from "@/lib/providers/ChatHistoryContext";
import { ChatHistory } from "@/types/next-auth-extensions";

const ChatSidebar = () => {
    const { isExpanded , toggleSidebar } = useSidebar();
    const router = useRouter();
    const session = useSession();
    const userImage = session?.data?.user?.image;

    return (
        <div className={`max-w-[250px] h-full w-full flex flex-col items-start bg-sidebar transition-all duration-500 border-r border-border
            ${isExpanded ? '' : '-translate-x-full'}`}
        >
            <div className="w-full flex items-center justify-between gap-4 px-2 pt-2">
                <button 
                    className="w-9 h-9 bg-transparent rounded-full shadow-sidebar-accent hover:bg-sidebar-border cursor-pointer flex items-center justify-center"
                    onClick={toggleSidebar}
                >
                    <Sidebar className="w-5 h-5 text-muted-foreground"/>
                </button>
                <div className="w-fit flex items-center justify-end gap-2">
                    <button className="w-9 h-9 rounded-full bg-transparent shadow-sidebar-accent hover:bg-sidebar-border cursor-pointer flex items-center justify-center"
                        onClick={() => console.log("search clicked")}>
                        <Search className="w-5 h-5 text-muted-foreground"/>
                    </button>
                    <button 
                        className="w-9 h-9 rounded-full bg-transparent shadow-sidebar-accent cursor-pointer hover:bg-sidebar-border flex items-center justify-center"
                        onClick={() => {
                            router.push("/chat?mode=auto");
                        }}
                    >
                        <SquarePen className="w-5 h-5 text-muted-foreground"/>
                    </button>
                </div>
            </div>

            <div className="w-full flex flex-col justify-start items-center pb-1 px-2 border-b border-border">
                <Link href="/chat?mode=auto" className="p-2 hover:bg-sidebar-border rounded-md w-full flex justify-center"> <div className="text-lg font-semibold text-foreground"> Metamind </div> </Link>
                {/* TODO : Add a button to open model for choosing different models */}
            </div>

            <ChatHistoryComponent />

            <div className="px-2 w-full cursor-pointer">
            <div className="h-16 w-full mb-2 hover:bg-sidebar-border rounded-md">
                <div className="w-full h-full px-3 py-2 flex items-center justify-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                        {
                            (userImage && userImage !== null) ? 
                            <img
                                src={userImage}
                                loading="lazy"
                                className="w-full h-full object-cover rounded-full bg-gradient-to-br from-red-500 to bg-pink-700" 
                            />
                             :
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500 to bg-pink-700" />
                        }
                    </div>
                    <div className="w-fit h-fit">
                        <div className="text-sm text-foreground">
                            {session.data?.user.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Free
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

const ChatHistoryComponent = () => {
    const { chatHistory , refreshHistory } = useChatHistory();
    const [currentChat , setCurrentChat] = useState<ChatHistory | null>(null);
    const [groupedChats, setGroupedChats] = useState<{ [key: string]: ChatHistory[] }>({});
    const [isLoading , setIsLoading] = useState<boolean>(false);
    const session = useSession();
    const pathName = usePathname();
    const router = useRouter();

    useEffect(() => {
        if(!pathName || pathName === null) return;
        const arr = pathName.split('/');
        const chatId = arr[arr.length-1];
        const chat = chatHistory.find((item) => item.id === chatId);

        if(chat && chat !== null) setCurrentChat(chat);
        else setCurrentChat(null);

        if (chatHistory.length > 0) {
            const groups = groupChatsByDate(chatHistory);
            setGroupedChats(groups);
        }
    }, [chatHistory]);

    // Fetch history whenever the pathname changes and then based on history choose the current chat
    useEffect(() => { 
        const getInitialChats = async () => {
            setIsLoading(true);
            await refreshHistory();
            setIsLoading(false);
        }
        
        getInitialChats();
    }, [session , pathName]);

    const groupOrder = ["Today", "Yesterday", "Previous Week", "Previous"];

    const handleClick = (chatId : string) => {
        const clickedChat = chatHistory.find((item) => item.id === chatId);
        if(clickedChat) setCurrentChat(clickedChat);
    }

    const handleChatDelete = async (chatId : string) => {
        if(session.status === 'unauthenticated' || !session.data) return;

        try{
            const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/chat/${chatId}`
            const response = await axios.delete(url , {
                headers : { "Authorization" : `Bearer ${session.data.user.token}` }
            });

            if(response.status === 200){
                if(currentChat && currentChat.id === chatId){
                    router.push("/chat?model=auto");
                    setCurrentChat(null);
                }
                refreshHistory();
            }

        }catch(err){
            console.log("An error occured while deleting chat : " , err);
            alert("An error occured while deleting chat");
        }
    }

    if(isLoading && (!chatHistory || chatHistory.length == 0)){
        return (
            <div className="flex-1 flex flex-col w-full h-full items-center justify-center">
                <LoadingSpinner size="md"/>
            </div>
        );
    }

    if(!chatHistory || chatHistory.length === 0){
        return (
          <div className="flex-1 flex flex-col w-full items-center justify-center text-foreground">
                No Chats availaible
          </div>  
        );
    }

    return (
        <div className="flex-1 flex flex-col gap-4 items-start justify-start w-full h-full overflow-y-auto mt-2 p-2">
            {groupOrder.map((groupName) => {
                const chats = groupedChats[groupName] || [];
                if (chats.length === 0) return null;
                return (
                    <div key={groupName} className="w-full">
                        <div className="w-full text-sm text-muted-foreground px-4 text-start mb-1">
                            {groupName}
                        </div>
                        <div>
                            {chats.map((chat) => (
                            <div
                                key={chat.id}
                                className={`hover:bg-sidebar-border/50 ${currentChat?.id === chat.id  && 'bg-sidebar-border'} rounded-md px-4 py-1 w-full`}
                            >
                                <ChatName 
                                    chat={chat} 
                                    handleClick={handleClick} 
                                    onDelete={() => handleChatDelete(chat.id)}
                                />
                            </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const ChatName = ({ 
    chat, 
    handleClick, 
    onDelete 
} : { 
    chat: ChatHistory , 
    handleClick : (chatId : string) => void , 
    onDelete : () => void
}) => {
    const handleChatDelete = async (e : React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete();
    };

    return (
        <Link href={`/chat/${chat.id}`} onClick={() => handleClick(chat.id)} className="w-full h-8 flex items-center justify-between group">
            <div className="text-foreground text-sm line-clamp-1 text-start">
                {chat.name}
            </div>
            <div className="w-fit flex items-center justify-end gap-1 invisible group-hover:visible ease-in-out transition-all duration-100">
                <button
                    className="w-6 h-6 rounded bg-transparent cursor-pointer flex items-center justify-center
                    text-muted-foreground hover:bg-pink-700 hover:text-white"
                    onClick={(e) => handleChatDelete(e)}
                >
                    <X size={18}/>
                </button>
            </div>
        </Link>
    );
};

// Helper function to group chats by date
const groupChatsByDate = (chats: ChatHistory[]) => {
    const groups: { [key: string]: ChatHistory[] } = {
      Today: [],
      Yesterday: [],
      "Previous Week": [],
      Previous: [],
    };
  
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
  
    chats.forEach((chat) => {
      const chatDate = new Date(chat.lastUsedAt);
  
      // Check if chat is from Today
      if (chatDate.toDateString() === now.toDateString()) {
        if (!groups["Today"]) groups["Today"] = [];
        groups["Today"].push(chat);
      } else if (chatDate.toDateString() === yesterday.toDateString()) {
        // Check if chat is from Yesterday
        if (!groups["Yesterday"]) groups["Yesterday"] = [];
        groups["Yesterday"].push(chat);
      } else {
        // Calculate difference in days between now and chat date
        const diffTime = now.getTime() - chatDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays < 7) {
          if (!groups["Previous Week"]) groups["Previous Week"] = [];
          groups["Previous Week"].push(chat);
        } else {
          if (!groups["Previous"]) groups["Previous"] = [];
          groups["Previous"].push(chat);
        }
      }
    });
  
    return groups;
};

export default ChatSidebar;
