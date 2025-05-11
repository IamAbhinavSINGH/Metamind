"use client"

import SignupComponent from "@/pages/auth/SignupComponent";
import ThemeToogle from "@/components/ThemeToggle";

export default function Signup() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background transition-colors duration-300">
            <div className="absolute top-4 right-4">
                <ThemeToogle />
            </div>
            <div className="w-full max-w-md">
                <SignupComponent />
            </div>
        </div>
    );
}