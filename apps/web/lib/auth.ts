import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions , Session } from "next-auth";
import axios from "axios";
import { JWT } from "next-auth/jwt";


const validateUser = async ( 
    email : string , password : string 
) : Promise<{ data : null } | { data : { 
    name : string,
    email : string,
    token : string,
    userId : string
}}>  => {
    try{
        const url = process.env.NEXT_PUBLIC_BACKEND_BASE_URL + '/api/v1/auth/login';
        console.log("validate user : " , url);
        const response = await axios.post(url , { email : email , password : password });

        if(response.status === 200 && response.data){
            return {
                data : {
                    name : response.data.name,
                    email : response.data.email,
                    token : response.data.token,
                    userId : response.data.userId
                }
            }
        }
        else return { data : null };
    }catch(err){
        console.log("An error occured while validating user : " , null);
    }

    return { data : null };
}

const signupUser = async (
    name : string,
    email : string,
    password : string,
    provider : "Credential" | "Google" | "Github"
) : Promise< { data : null } | { data : {
    name : string,
    email : string,
    token : string,
    userId : string
}} >  => {

    try{
        const url = process.env.NEXT_PUBLIC_BACKEND_BASE_URL + '/api/v1/auth/signup';
        console.log("signupuser URL : " , url);
        const response = await axios.post(url , { 
            name : name , 
            email : email , 
            password : password , 
            provider : provider 
        });

        console.log("response after signning up user : " , response.data);

        if(response.status === 200 && response.data.token){
            return {
                data : {
                    name : response.data.name,
                    email : response.data.email,
                    token : response.data.token,
                    userId : response.data.userId
                }
            }
        }
        else return { data : null };
    }catch(err){
        console.log("An error occured while signing up the user : " , err);
    }

    return { data : null };
};

export interface CustomSession extends Session {
    user : {
        userId : string,
        name : string,
        email : string,
        token : string
    }
}

export interface CustomToken extends JWT{
    userId : string,
    name : string,
    email : string,
    token : string
}

export const authOptions : NextAuthOptions = {
    providers : [
        CredentialsProvider({
            name : 'Credential',
            credentials : { 
                name : { label : "Name" , type : "text" , placeholder : "name..." },
                email : { label : "Email" , type : "email" , placeholder : "email...." },
                password : { label : "Password" , type : "password" , placeholder : "password..." },
                isLogin : { label : "isLogin" , type : 'boolean' }
            },
            async authorize(credentials : any) {
                console.log("authorize invoked : " , credentials);

                if(!credentials || credentials === null) return null;
                var user = null;
                
                if(credentials.isLogin && credentials.isLogin === 'true') user = await validateUser(credentials.email , credentials.password);
                else user = await signupUser(credentials.name , credentials.email , credentials.password , 'Credential');

                console.log("authorization complete : " , user);

                if(user === null || user.data === null) return null;
                return {
                    name : user.data.name,
                    email : user.data.email,
                    token : user.data.token,
                    id : user.data.userId
                }
            }
        })
    ],
    pages : {
        signIn : '/auth/signin',
        error : '/auth/signin'
    },
    secret : process.env.NEXTAUTH_SECRET || 'next-auth-secret',
    callbacks : {
        async session({ session , token } : any ){
            const customSession : CustomSession = session;
            const customToken : CustomToken = token;

            if(customToken){
                customSession.user = {
                    userId : customToken.userId,
                    name : customToken.name,
                    email : customToken.email,
                    token : customToken.token
                }
            }

            return customSession;
        },
        
        async jwt({ token , user } : any){
            const customToken : CustomToken = token;

            if(user){
                customToken.userId = user.id;
                customToken.name = user.name;
                customToken.email = user.email;
                customToken.token = user.token;
            }

            return customToken;
        }
    }
} satisfies NextAuthOptions;