import { Router } from "express";
import { authRouter } from "./auth";
import { chatRouter } from "./chat";
import { chatsRouter } from "./chats";
import { filesRouter } from './file';
import { authMiddleware } from "../middleware/authMiddleware";
import { messageRouter } from "./message";

const router = Router();

router.use('/auth' , authRouter);
router.use('/chat' , authMiddleware , chatRouter);
router.use('/chats' , authMiddleware , chatsRouter);
router.use('/message' , authMiddleware , messageRouter);
router.use('/file' , authMiddleware , filesRouter);

export default router;