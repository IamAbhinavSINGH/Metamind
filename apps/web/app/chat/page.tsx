"use client"

import ChatInitialization from "@/pages/ChatInitalization";
import { ModelType } from "@repo/types";
import { useSession } from "next-auth/react";
import { useSearchParams , useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";


export default function Chat() {
    const session = useSession();
    const searchParams = useSearchParams();
    const model = searchParams?.get("model") as ModelType || "auto";
    const router = useRouter();
    const pathName = usePathname();

    useEffect(() => {
        if(session.status === 'unauthenticated'){
            router.push("/auth/login");
        }
    }, [session , router]);

    const handleModelChange = (model : string) => {
        if(pathName != null){
            // change the searchparam while keeping the scroll position same
            router.replace(
                `${pathName}?model=${model}`,
                undefined
            );
        }
    }

    return (
        <div className="max-h-screen min-h-screen flex flex-col bg-sidebar-accent">
            <ChatInitialization 
                initialModel={model || 'auto'}
                onModelChange={(model : string) => handleModelChange(model)}
            />
        </div>
    );
};