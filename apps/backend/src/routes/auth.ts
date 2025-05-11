import { Router , Request , Response } from "express";
import { z } from 'zod';
import db from '@repo/db';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { generateToken, verifyToken } from "../utils/jwtUtils";
import { OAuth2Client } from "google-auth-library";
import { getUser } from "../controller/db";

const signupSchema = z.object({
    name : z.string().min(3).max(40),
    email : z.string().email(),
    password : z.string().min(5).max(20),
    provider : z.enum(["Credential"])
});

const loginSchema = z.object({
    email : z.string().email().optional(),
    phoneNumber : z.string().optional(),
    password : z.string().min(5).max(20)
});

const oauthSchema = z.object({
    oAuthToken : z.string(),
    provider : z.enum(["Google" , "Github"])
})

export const authRouter = Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '' , process.env.GOOGLE_CLIENT_SECRET || '' , process.env.FRONTEND_URL);

const saltRounds = 10;


authRouter.post('/signup' , async (req : Request , res : Response) => {
    try{
        const parsedSchema = signupSchema.safeParse(req.body);
        
        if(!parsedSchema.success){
            res.status(401).json({ error : "Invalid inputs!!" });
            return;
        }
        const body = parsedSchema.data;
        
        const alreadyExist = await db.user.findFirst({ where : { email : body.email } });
        if(alreadyExist && alreadyExist != null){
            res.json(500).json({ error : "An user already exist with the given number or email!!" });
            return;
        }
        
        const hashedPassword = await bcrypt.hash(body.password , saltRounds);

        const user = await db.user.create({
            data : {
                email : body.email,
                password : hashedPassword,
                provider : body.provider,
                name : body.name
            }
        });

        const newToken = generateToken({ userId : user.id }); 
        await db.user.update({ where : { id : user.id } , data : { token : newToken } });
        
        res.json({ 
            message : "User created successfully!!" ,
            userId : user.id,
            token : newToken,
            name : user.name,
            email : user.email
        });
    }catch(err){
        console.log("An error occured while signing the user : " , err);
        res.status(500).json({ error : "Internal server error" });
    }
});

authRouter.post('/login' , async (req : Request , res : Response) => {
    try{
        const parsedSchema = loginSchema.safeParse(req.body);
        if(!parsedSchema.success || (parsedSchema.data.email === null && parsedSchema.data.phoneNumber === null)){
            res.status(401).json({ error : "Invalid inputs!" });
            return;
        }
        const data = parsedSchema.data;

        const existingUser = await db.user.findFirst({ where : { email : data.email || "" , phoneNumber : data.phoneNumber } });
        if(!existingUser || existingUser.password === null){
            res.status(401).json({ error : "Invalid credentials!!" });
            return;
        }

        const passwordMatch = await bcrypt.compare(data.password , existingUser.password);
        if(!passwordMatch){ 
            res.status(401).json({ error: "Invalid credentials!!" });
            return;
        }

        const newToken = generateToken({ userId : existingUser.id }); 
        const user = await db.user.update({ where : { id : existingUser.id } , data : { token : newToken } });


        res.json({
            message : "Login successfull!!",
            token : newToken,
            userId : user.id,
            name : user.name,
            email : user.email
        });

        return;
    }catch(err){
        console.log("An error occured while logining the user : " , err);
        res.status(500).json({ error : "Internal server error" });
    }
});

authRouter.post('/oauth' , async (req : Request , res : Response) => {
    try{
        const parsedSchema = oauthSchema.safeParse(req.body);
        if(!parsedSchema.success){
            res.status(401).json({ error : "Invalid inputs!!" });
            return;
        }
        const { oAuthToken , provider } = parsedSchema.data;
        const ticket = await googleClient.verifyIdToken({
            idToken : oAuthToken,
            audience : process.env.GOOGLE_CLIENT_ID || ''
        });
        const payload = ticket.getPayload();

        if(!payload?.email_verified){
            res.status(401).json({ error : "Email not verified by Google!!" });
            return;
        }

        var user = await db.user.findFirst({  where : { email : payload.email } });
        if(!user){
            user = await db.user.create({
                data : {
                    email : payload.email || '',
                    name : payload.name || '',
                    provider : provider
                }
            });
        }

        const token = generateToken({ userId : user.id });
        user = await db.user.update({ where : { id : user.id } , data : { token : token } });

        res.json({
            message : "Login successfull!",
            user : {
                token : token,
                id : user.id,
                name : user.name,
                email : user.name
            }
        });

        return;
    }catch(err){
        console.log("An error occured while signing in oauth user : " , err);
        res.status(500).json({ error : "Internal server error!" });
    }
})

authRouter.get('/verify' , async(req : Request , res : Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    try{
        if(!token){
            res.status(401).json({ error: "Unauthorized: No token provided" });
            return;
        }

        try {
            const decoded = verifyToken(token);
            if(!decoded || !decoded.userId){
                res.status(401).json({ error : "Invalid token!" });
            }

            const user = await db.user.findFirst({ where : { id : decoded.userId , token : token } });
            if(!user || user === null){
                res.status(401).json({ error : "Unauthorized!!" });
                return;
            }
            
            const newToken = generateToken({ userId : user.id });
            await db.user.update({ where : { id : user.id } , data : { token : newToken } });

            res.json({
                message : "Token verified!!",
                user : {
                    token : newToken,
                    id : user.id,
                    email : user.email,
                    name : user.name
                }
            });
            return;
        } catch (err) {
            if (err instanceof jwt.JsonWebTokenError) {
                console.error("JWT Error:", err.message);
                res.status(401).json({ error: "Invalid token!" });
            }
            if (err instanceof jwt.TokenExpiredError) {
                res.status(401).json({ error: "Token expired! Please log in again." });
            }
            if (err instanceof jwt.NotBeforeError) {
                res.status(401).json({ error: "Token not yet active!" });
            }
            throw err; // If the error isn't JWT-related, rethrow it
        }
    }catch(err){
        console.log("An error occured while verifying token : " , err);
        res.status(500).json({ error : "Internal server error!" });
    }
});