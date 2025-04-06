"use client"

import ChatSidebar from "@/components/ChatSidebar";
import { ChatTopBar } from "@/components/ChatTopBar";
import { useSidebar } from "@/lib/providers/SidebarContext";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect }  from 'react';


export default function ChatLayout({ children } : { children : React.ReactNode }){
    const pathName = usePathname();
    const { isExpanded } = useSidebar();
    const session = useSession();
    const router = useRouter();

    useEffect(() => {
        if(session.status === 'unauthenticated'){
            router.push("/auth/login");
        }
    } , [session , router]);
    
    if(session.status === 'loading'){
        return null;
    }

    return (
        <div className="flex w-full h-screen overflow-hidden">
            <ChatSidebar />
            <main
                className={`flex-1 transition-all duration-500 ${isExpanded ? "" : "-ml-[250px]"}`}
            >
                <ChatTopBar />
                {children}
            </main>
        </div>
    );
}