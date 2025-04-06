import { CoreMessage } from "ai";
import { MessageType } from "../controller/db";

export const convertChatsToCoreMessages = (pastChats : MessageType[]) : CoreMessage[] => {
    const messages : CoreMessage[] = [];
    const chats = pastChats.reverse();

    for (const chat of chats){
        messages.push({ role : 'user' , content : chat.prompt });
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