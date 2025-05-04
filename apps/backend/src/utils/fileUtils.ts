import { S3Client , PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid';

interface UploadFilesProps{
    fileName : string,
    fileSize : string,
    fileType : string   
}

const s3 = new S3Client({
    region : 'ap-south-1',
    credentials : {
        accessKeyId : process.env.AWS_ACCESS_KEY || '',
        secretAccessKey : process.env.AWS_SECRET_KEY ||  ''
    }
});

export const getUploadUrl = async ({ fileName , fileSize , fileType } : UploadFilesProps) => {
    try{
        if (parseInt(fileSize) > 20 * 1024 * 1024) {
            return { error : "File size too large" };
        }

        const fileId = uuidv4();
        const sanitizedFileName = fileName.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        const key = `users/uploads/${fileId}_${sanitizedFileName}`;

        const putCommand = new PutObjectCommand({
            Bucket : process.env.AWS_BUCKET_NAME || '',
            Key : key,
            ContentType : fileType,
        })

        const url = await getSignedUrl(s3 , putCommand , { expiresIn : 60 * 60 });
        return {
            url : url,
            key : key,
            fileId : `${fileId}_${sanitizedFileName}`,
            originalFileName : sanitizedFileName
        };
    }catch(err){
        console.log("An error occured while generating upload url : " , err);
        return { error : "Internal server error" };
    }
}


export const getReadUrl = async ({ key } : { key : string }) => {
    try{
        const getCommand = new GetObjectCommand({
            Bucket : process.env.AWS_BUCKET_NAME || '',
            Key : key
        });

        return await getSignedUrl(s3 , getCommand , { expiresIn : 60 * 60 });
    }catch(err){
        console.log("An error occured while creating read url : " , err);
        return null;
    }
}