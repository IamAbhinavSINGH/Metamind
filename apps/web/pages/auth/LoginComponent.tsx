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

    return (
        <Card className="w-full max-w-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold">Login</CardTitle>
                <CardDescription>
                    Enter your email and password to access your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="name@example.com" 
                            className="pl-10"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData , email : e.target.value })} 
                            required 
                        />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Button variant="link" className="p-0 h-auto text-xs">
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
                            onChange={(e) => setFormData({ ...formData , password : e.target.value })} 
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                    </Button>
                    <div className="text-red-500 text-center w-full">
                        {(error && error.length > 0) && error}
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col">
                <div className="mt-2 text-center text-sm">
                    Don't have an account?{" "}
                    <Link href={'/auth/signup'} className="p-0 h-auto">
                        Sign up
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}

export default LoginComponent;