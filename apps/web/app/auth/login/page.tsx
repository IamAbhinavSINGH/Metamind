"use client"

import LoginComponent from "@/pages/auth/LoginComponent";
import ThemeToogle from "@/components/ThemeToggle";

export default function Signin() {
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background transition-colors duration-300">
            <div className="absolute top-4 right-4">
                <ThemeToogle />
            </div>
            <div className="w-full max-w-md">
                <LoginComponent />
            </div>
        </div>
    );
}