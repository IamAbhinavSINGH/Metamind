import { CoreMessage, FilePart, ImagePart } from "ai";
import { MessageType } from "../controller/db";
import { FileMetaData } from "../controller/handleChat";
import { getReadUrl } from "./fileUtils";

export const convertChatsToCoreMessages = async (pastChats : MessageType[]) : Promise<CoreMessage[]> => {
    const messages : CoreMessage[] = [];
    const chats = pastChats.reverse();

    for (const chat of chats){
        await pushUserMessage(messages , chat.prompt , chat.attachments ? chat.attachments : []);
        
        if(chat.response !== null && chat.response.length > 0){
            messages.push({ role : 'assistant' , content : chat.response });
        }
    }

    return messages;
}

// convert bigInt to string
export const bigintReplacer = (key: string, value: any) => {
    return typeof value === 'bigint' ? value.toString() : value;
};

export const pushUserMessage = async (
    messages : CoreMessage[],  
    content : string,
    attachments : FileMetaData[]
) => {

    const fileContents =  await Promise.all(attachments.map(async (file) => {
        const dataURL = new URL(await getReadUrl({ key : file.fileKey}) || '');
            if(file.fileType.startsWith('image/')) {
                return {
                    type : 'image',
                    fileName : file.fileName,
                    mimeType : file.fileType,
                    image : dataURL
                } as ImagePart;
            }
            return {
                type : 'file',
                fileName : file.fileName,
                mimeType : file.fileType,
                data : dataURL
            } as FilePart;
    }));

    messages.push({
        role : 'user',
        content : [ { type : 'text', text : content }, ...fileContents ],
    })
}