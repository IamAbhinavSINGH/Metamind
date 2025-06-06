import { Message } from "@/types/next-auth-extensions";
import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useSession } from "next-auth/react";


const MessageDeleteModal = ({ 
    message, 
    onClose, 
    chatId, 
    onDeleteSuccess 
} : { 
    message : Message, 
    onClose : () => void, 
    chatId : string,
    onDeleteSuccess : () => void
}) => {
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const session = useSession();

    const handleDelete = async () => {
        try{
            if(!session.data || !message.id || message.id === '') return;
            setIsDeleting(true);
            const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/message`;
    
            const response = await axios.delete(url , {
                params : { messageId : message.id , chatId : chatId},
                headers : { "Authorization" : `Bearer ${session.data?.user.token}` }
            });
    
            if(response.status === 200) onDeleteSuccess();
            else  alert("Could not delete the message!!");
        
        }catch(err){
            console.log("An error occured while deleting the message : " , err);
            alert("Could not delete the message!!");
        }
        finally{
            setIsDeleting(false);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 backdrop-brightness-25 flex items-center px-4 justify-center z-50">
            <Card className="w-full max-w-md bg-secondary opacity-100 shadow-lg rounded-lg">
                <CardHeader className="text-lg font-semibold"> Delete Message </CardHeader>
                <CardContent>
                    <p className="pb-8">Are you sure you want to delete this message?</p>
                    <div className="flex justify-end items-center gap-4">
                        <button
                            className="bg-pink-700 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-pink-800 transition-colors"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                        <button className="ml-2 cursor-pointer" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default MessageDeleteModal;