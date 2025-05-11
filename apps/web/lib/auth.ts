import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions , Session } from "next-auth";
import axios from "axios";
import { JWT } from "next-auth/jwt";
import { signOut } from "next-auth/react";

export interface CustomSession extends Session {
    user : {
        userId : string,
        name : string,
        email : string,
        token : string,
        image : string | null
    }
}

export interface CustomToken extends JWT{
    userId : string,
    name : string,
    email : string,
    token : string,
    image : string | null
}

interface SigninOAuthUserProps{
    oAuthToken : string,
    provider : 'Google' | 'Github'
}

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
        const response = await axios.post(url , { 
            name : name , 
            email : email , 
            password : password , 
            provider : provider 
        });

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

const signInOAuthUser = async ({
    oAuthToken,
    provider
} : SigninOAuthUserProps) => {
    try{
        const url = `${process.env.NEXTAUTH_BACKEND_URL}/api/v1/auth/oauth`;
        const response = await axios.post(url , {
            oAuthToken : oAuthToken,
            provider : provider
        });

        if(response.status === 200 && response.data.user && response.data.user.token){
            const { user } = response.data;
            return {
                token : user.token,
                id : user.id,
                name : user.name,
                email : user.email
            };
        }
        else return null;
    }catch(err){
        console.log("An error occured while signing in oauth user : " , err);
        return null;
    }
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
                if(!credentials || credentials === null) return null;
                var user = null;
                
                if(credentials.isLogin && credentials.isLogin === 'true') user = await validateUser(credentials.email , credentials.password);
                else user = await signupUser(credentials.name , credentials.email , credentials.password , 'Credential');

                if(user === null || user.data === null) return null;
                return {
                    name : user.data.name,
                    email : user.data.email,
                    token : user.data.token,
                    id : user.data.userId
                }
            }
        }),
        GoogleProvider({
            clientId : process.env.GOOGLE_CLIENT_ID || '',
            clientSecret : process.env.GOOGLE_CLIENT_SECRET || '',
            authorization : {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        })
    ],
    
    session : {
        strategy : 'jwt',
        maxAge: 60 * 60,      // 1 hour
        updateAge: 15 * 60,   // call session callback every 15 minutes
    },

    pages : {
        signIn : '/auth/signin',
        error : '/auth/signin'
    },

    secret : process.env.NEXTAUTH_SECRET || 'next-auth-secret',

    callbacks : {
        async signIn({ account , profile }) {
            if(account?.provider === 'google'){
                const oauthToken = account.id_token;
                if(!oauthToken || oauthToken === null) return false;

                const oauthUser = await signInOAuthUser({ oAuthToken : oauthToken , provider : "Google" });
                if(!oauthUser || oauthUser === null) return false;

                (profile as any).oauthUser = oauthUser;
            }
            return true;
        },

        async session({ session , token } : any ) : Promise<CustomSession> {
            const customSession : CustomSession = session;
            const customToken : CustomToken = token;

            customSession.user.userId = customToken.userId;
            customSession.user.name = customToken.name;
            customSession.user.email = customToken.email;
            customSession.user.token = customToken.token;
            customSession.user.image = customToken.image;

            return customSession;
        },
        
        async jwt({ token , user , profile } : any){
            const customToken : CustomToken = token;

            if(user){
                const oauth = (profile as any).oauthUser;
                
                if(oauth){
                    customToken.userId = oauth.id;
                    customToken.email = oauth.email;
                    customToken.name = oauth.name;
                    customToken.token = oauth.token;
                    customToken.image = user.image;
                }
                else{
                    customToken.userId = user.id;
                    customToken.name = user.name;
                    customToken.email = user.email;
                    customToken.token = user.token;
                    customToken.image = null;
                }
            } else {
                try {
                    const url = `${process.env.NEXTAUTH_BACKEND_URL}/api/v1/auth/verify`;
                    const response = await axios.get(url , { headers: { Authorization: `Bearer ${customToken.token}` } });
                    
                    if (response.status === 200 && response.data.user) {
                        const { user } = response.data;
                        customToken.userId = user.id || '';
                        customToken.name = user.name || '';
                        customToken.email = user.email || '';
                        customToken.token = user.token || '';
                        customToken.image = customToken.image || null;
                    }
                } catch(err) {
                    console.log("An error occured while trying to verify token : " , err);
                    await signOut();
                    return {};
                }
            }

            return customToken;
        }
    }
} satisfies NextAuthOptions;