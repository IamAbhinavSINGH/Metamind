import React, { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useSidebar } from "@/lib/providers/SidebarContext";
import { ChevronRight, Sidebar } from "lucide-react";
import { useParams } from "next/navigation";
import { useTheme } from "@/lib/providers/ThemeProvider";
import { ChatHistory } from "@/types/next-auth-extensions";
import { useChatHistory } from "@/lib/providers/ChatHistoryContext";


export const ChatTopBar = () => {
    const { isExpanded , toggleSidebar } = useSidebar();
    const session = useSession();
    const params = useParams();
    const chatId = params?.chatId;
    const [currentChat , setCurrentChat] = useState<ChatHistory | null>(null);
    const { chatHistory } = useChatHistory();

    useEffect(() => {
        const currentChat = chatHistory.find((item : ChatHistory) => item.id === chatId);
        if(currentChat) setCurrentChat(currentChat);
    }, [chatId , session , chatHistory]);

    return (
        <div>
            <div className="w-full sticky top-0 z-50 h-12 flex justify-between bg-sidebar-accent items-center py-2 px-4 border-b">
                <div className="w-fit flex justify-start items-center gap-2">
                    {!isExpanded &&
                            <button className="w-9 h-9 bg-transparent shadow-sidebar-accent flex items-center justify-center rounded-full hover:bg-sidebar-border cursor-pointer" 
                            onClick={toggleSidebar}>
                                <Sidebar className="w-5 h-5 text-muted-foreground"/>
                            </button>
                    }
                    <Link href="/chat?mode=auto"> <div className="text-lg font-semibold text-foreground"> Metamind </div> </Link>
                </div>
                <div className="text-lg font-semibold text-foreground">{currentChat !== null ? currentChat.name : "New Chat"}</div>
                <UserProfileIcon />
            </div>

        </div>
    );
};

const UserProfileIcon = () => {
    const session = useSession();
    const [isMenuOpen , setIsMenuOpen] = useState<boolean>(false);
    const divRef = useRef<HTMLDivElement | null>(null);
    const itemRef = useRef<HTMLDivElement | null>(null);
    const userImage = session?.data?.user.image

    if(session.status === 'loading'){
        return null;
    }

     useEffect(() => {
        const handleClickOutside = (event : any) => {
            if(divRef.current && !divRef.current.contains(event.target) && !itemRef.current?.contains(event.target)){
                setIsMenuOpen(false);
            }
        }

        window.addEventListener('click' , handleClickOutside);

        () => window.addEventListener('click' , handleClickOutside);
    }, []);

    return (
        <div className="w-fit flex items-center justify-end gap-2" ref={divRef}>
            <DropdownMenu open={isMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer w-8 h-8 overflow-hidden rounded-full" onClick={() => setIsMenuOpen(true)}>
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
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent ref={itemRef} align="end" className="border-border my-2 rounded-md max-w-md w-full p-2 overflow-visible">
                    <DropdownMenuItem className="overflow-visible">
                        <ThemeToogleSubMenu />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <button>
                            Settings
                        </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <button onClick={() => {
                            signOut()
                        }}>
                            Logout
                        </button>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
};

const ThemeToogleSubMenu = () => {
    const { setTheme } = useTheme();
    const [isSubMenuOpen , setIsSubMenuOpen] = useState<boolean>(false);

    return (
        <div className="relative overflow-visible">
            <div className="w-full h-full flex items-center justify-start"
                onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
            >
                Change theme
                <ChevronRight/>
            </div>

            {
                isSubMenuOpen && 
                (
                    <div className="absolute top-0 -left-[120px] bg-card shadow-md text-start h-fit w-24 p-2 border-border rounded-lg flex flex-col items-start justify-start">
                        <button className="hover:bg-stone-100 dark:hover:bg-white/10 text-foreground px-3 py-1 rounded-sm text-start w-full"
                            onClick={() => setTheme('light')}
                        >
                            Light
                        </button>
                        <button className="hover:bg-stone-100 dark:hover:bg-white/10 text-foreground px-3 py-1 rounded-sm text-start w-full"
                            onClick={() => setTheme('dark')}
                        >
                            Dark
                        </button>
                        <button className="hover:bg-stone-100 dark:hover:bg-white/10 text-foreground px-3 py-1 rounded-sm text-start w-full"
                            onClick={() => setTheme('system')}
                        >
                            System
                        </button>
                    </div>
                )
            }
        </div>
    );
}