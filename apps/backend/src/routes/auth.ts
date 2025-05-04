import { Router , Request , Response } from "express";
import { z } from 'zod';
import db from '@repo/db';
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/jwtUtils";

const signupSchema = z.object({
    name : z.string().min(3).max(40),
    email : z.string().email(),
    password : z.string().min(5).max(20),
    provider : z.enum(["Google" , "Github" , "Credential"])
});

const loginSchema = z.object({
    email : z.string().email().optional(),
    phoneNumber : z.string().optional(),
    password : z.string().min(5).max(20)
});

export const authRouter = Router();
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
        if(!existingUser){
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

       console.log('login api hit , login succesfull : ' , newToken , user.name);

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