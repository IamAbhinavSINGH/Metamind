import { Router , Response } from "express";
import z from 'zod';
import { AuthRequest } from "../middleware/authMiddleware";
import { getUser } from "../controller/db";
import { getReadUrl, getUploadUrl } from "../utils/fileUtils";

export const filesRouter = Router();

const filesSchema = z.object({
    fileName : z.string(),
    fileSize : z.string(),
    fileType : z.string(),
});


filesRouter.post('/' , async (req : AuthRequest , res : Response) => {
    try{
        const userId = req.userId as string;
        const user = await getUser(userId);

        if(!user || user === null){
            res.status(401).json({ error : "Unauthorized!!" });
            return;
        }

        const parsedSchema = filesSchema.safeParse(req.body);
        if(!parsedSchema.success){
            res.status(400).json({ error : "Invalid inputs!!" });
            return;
        }
        const body = parsedSchema.data;

        const result = await getUploadUrl({ fileName: body.fileName, fileSize: body.fileSize, fileType: body.fileType });

        if(result?.error && result?.error !== null){
            res.status(500).json({ error : result.error });
            return;
        }

        res.json({
            url : result.url,
            key : result.key,
            fileId : result.fileId
        });
        return;
    }catch(err){
        console.log("An error occured while creating signed url : " , err);
        res.status(500).json({ error : "Internal Server Error!!" });
    }
});

filesRouter.get('/' , async (req : AuthRequest , res : Response) => {
    try{
        const userId = req.userId as string;
        const user = await getUser(userId);

        if(!user || user === null){
            res.status(401).json({ error : "Unauthorized!!" });
            return;
        }

        const fileKey = req.query.fileKey as string | undefined;
        if(!fileKey || fileKey === null){
            res.status(400).json({ error : "Invalid inputs!" });
            return;
        }

        const url = await getReadUrl({ key : fileKey });

        if(url === null){
            res.status(500).json({ error : "Internal Server Error!" });
            return;
        }

        res.json({ readURL : url });

        return;
    }catch(err){
        console.log("An error occured while creating signed url : " , err);
        res.status(500).json({ error : "Internal Server Error!!" });
    }
});