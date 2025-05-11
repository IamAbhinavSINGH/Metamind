"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GoogleLogo from "@/components/ui/GoogleLogo";

interface SignupData {
    name : string,
    email : string,
    password : string,
    confirmPassword : string,
}


const SignupComponent = () => {

    const [formData , setFormData] = useState<SignupData>({
        name : "" , email : "" , password : "" , confirmPassword : ""
    });
    const [showPassword , setShowPassword] = useState<boolean>(false);
    const [showConfirmpassword , setShowConfirmpassword] = useState<boolean>(false);
    const [isLoading , setIsLoading] = useState<boolean>(false);
    const [errors , setErrors] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if(formData.name.length < 3){
            setErrors("Name must be atleast 3 characters long!");
            return;
        }

        if(formData.password !== formData.confirmPassword){
            setErrors("Passwords do not match , try again!");
            return;
        }

        setIsLoading(true);

        try{
            const response = await signIn('credentials' , { 
                name : formData.name,
                email : formData.email ,
                password : formData.password,
                isLogin : false,
                redirect : false
            });
            
            if(response && response.ok){
                setIsLoading(true);
                setErrors(null); 
                router.push('/chat?model=auto');
            }
            else if(response && response.status === 401){
                setErrors("Invalid credentials , try again!");
            }
            else if(response && response.status === 400){
                setErrors("Missing credentials , try again!");
            }
            else if(response && response.status === 404){
                setErrors("No user found with the given credentials , try again!");
            }
            else if(response && response.status === 403){
                setErrors("Forbidden!");
            }
            else{
                setErrors("oops something went wrong...!");
            }

        }catch(err){
            console.log("An error occured while signing up the user : " , err);
        }

        setIsLoading(false);
    }

    const handleGoogleSignin = async () => signIn('google' , { callbackUrl : '/chat?model=auto' });
    
    return (
        <Card className="w-full max-w-lg h-full max-h-2xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center w-full font-semibold">Signup</CardTitle>
                <CardDescription>Enter your name email and password to signup as a user</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="name" 
                                type="text" 
                                placeholder="name" 
                                className="pl-10"
                                value={formData.name}
                                onChange={(e) => {
                                    setErrors("");
                                    setFormData({ ...formData , name : e.target.value })
                                }} 
                                required 
                            />
                        </div>
                    </div>

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
                                onChange={(e) => {
                                    setErrors("");
                                    setFormData({ ...formData , email : e.target.value })
                                }} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="password" 
                                type={showPassword ? "text" : "password"} 
                                className="pl-10 pr-10" 
                                required
                                placeholder="password"
                                value={formData.password}
                                onChange={(e) => {
                                    setErrors("");
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

                    <div className="space-y-2">
                        <Label htmlFor="password">Confirm Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="confirmPassword" 
                                type={showConfirmpassword ? "text" : "password"} 
                                className="pl-10 pr-10" 
                                required
                                placeholder="password"
                                value={formData.confirmPassword}
                                onChange={(e) => {
                                    setErrors("");
                                    setFormData({ ...formData , confirmPassword : e.target.value })
                                }} 
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-10 w-10"
                                onClick={() => setShowConfirmpassword(!showConfirmpassword)}
                            >
                                {showConfirmpassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">{showConfirmpassword ? "Hide password" : "Show password"}</span>
                            </Button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full text-base font-light text-background bg-foreground" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Signin"}
                    </Button>
                    { (errors && errors.length > 0) &&  <div className="text-pink-700 text-center w-full"> {errors} </div> }
                </form>

                 <div className="space-y-6">
                    <div className="text w-full text-center border-b border"></div>
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
                    Already have an account?{" "}
                    <Link href={'/auth/login'} className="p-0 h-auto underline underline-offset-2">
                        Log in
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
};

export default SignupComponent;
