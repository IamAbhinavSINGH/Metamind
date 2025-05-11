"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleLogo from "@/components/ui/GoogleLogo";


interface LoginData {
    email : string,
    password : string
}

const LoginComponent = () => {
    const [showPassword , setShowPassword] = useState<boolean>(false);
    const [isLoading , setIsLoading] = useState<boolean>(false);
    const [error , setError] = useState<string | null>(null);
    const [formData , setFormData] = useState<LoginData>({ email : "" , password : "" });
    const router = useRouter();

    const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try{
            const response = await signIn('credentials' , { 
                email : formData.email ,
                password : formData.password,
                isLogin : true, 
                redirect : false
            });

            if(response && response.ok){
                setIsLoading(true);
                setError(null); 
                router.push('/chat?model=auto');
            }
            else if(response && response.status === 401){
                setError("Invalid credentials , try again!");
            }
            else if(response && response.status === 400){
                setError("Missing credentials , try again!");
            }
            else if(response && response.status === 404){
                setError("No user found with the given credentials , try again!");
            }
            else if(response && response.status === 403){
                setError("Forbidden!");
            }
            else{
                setError("oops something went wrong...!");
            }

        }catch(err){
            console.log("An error occured while signing in the user : " , err);
            setError("An error occured while logging in , try again!");
        }

        setIsLoading(false);
    };

    const handleGoogleSignin = async () => signIn('google' , { callbackUrl : '/chat?model=auto' });

    return (
        <Card className="w-full max-w-lg bg-accent">
            <CardHeader className="space-y-1">
                <CardTitle className="text-3xl font-semibold text-center">Login</CardTitle>
                <CardDescription className="text-center">
                    Enter your email and password to access your account
                </CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="space-y-2 mb-4">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="name@example.com" 
                            className="pl-10"
                            value={formData.email}
                            onChange={(e) =>{
                                setError("");
                                setFormData({ ...formData , email : e.target.value })
                            }} 
                            required 
                        />
                        </div>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Button type="button" variant="link" className="p-0 h-auto text-xs cursor-pointer">
                            Forgot password?
                        </Button>
                        </div>
                        <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            className="pl-10 pr-10" 
                            required
                            value={formData.password}
                            onChange={(e) => {
                                setError("");
                                setFormData({ ...formData , password : e.target.value })
                            }} 
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full mb-2 text-base bg-foreground text-background cursor-pointer" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                    </Button>
                    {
                        (error && error.length > 0) &&  <div className="text-pink-700 text-center w-full"> {error}</div>
                    }
                </form>
                <div className="space-y-4">
                    <div className="w-full text-center border-b border"></div>
                   <button
                        type="button" 
                        onClick={handleGoogleSignin}
                        className="w-full h-fit bg-foreground text-background cursor-pointer rounded-md border border-border flex items-center justify-center px-3 py-1 gap-2">
                        <GoogleLogo className="h-8 w-8"/>
                        Continue with Google
                   </button>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col">
                <div className="mt-2 text-center text-sm">
                    Don't have an account?{" "}
                    <Link href={'/auth/signup'} className="p-0 h-auto underline underline-offset-2">
                        Sign up
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}

export default LoginComponent;