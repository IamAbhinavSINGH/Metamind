"use client"

import ChatInitialization from "@/pages/ChatInitalization";
import { ModelType } from "@repo/types/src/types/chat";
import { useSession } from "next-auth/react";
import { useSearchParams , useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Chat() {
    const session = useSession();
    const searchParams = useSearchParams();
    const model = searchParams?.get("model") as ModelType || "auto";
    const router = useRouter();

    useEffect(() => {
        if(session.status === 'unauthenticated'){
            router.push("/auth/login");
        }
    }, [session , router]);

    return (
        <div className="max-h-screen min-h-screen flex flex-col bg-sidebar">
            <ChatInitialization initialModel={model || 'auto'}/>
        </div>
    );
};