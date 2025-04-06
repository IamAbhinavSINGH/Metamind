import { Router } from "express";
import { authRouter } from "./auth";
import { chatRouter } from "./chat";
import { chatsRouter } from "./chats";
import { authMiddleware } from "../middleware/authMiddleware";
import { messageRouter } from "./message";

const router = Router();

router.use('/auth' , authRouter);
router.use('/chat' , authMiddleware , chatRouter);
router.use('/chats' , authMiddleware , chatsRouter);
router.use('/message' , authMiddleware , messageRouter);


export default router;