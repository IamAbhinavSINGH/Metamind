"use client"

import React , { createContext , useContext , useState } from "react"

interface SidebarContextProps {
    isExpanded : boolean;
    toggleSidebar : () => void;
    setSidebar : (value : boolean) => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const SidebarProvider = ({ children } : { children : React.ReactNode }) => {
    const [isExpanded , setIsExpanded] = useState(true);

    const toggleSidebar = () => setIsExpanded((prev) => !prev);
    const setSidebar = (value : boolean) => setIsExpanded(value);

    return (
        <SidebarContext.Provider value={{ isExpanded , toggleSidebar , setSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if(!context){
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}