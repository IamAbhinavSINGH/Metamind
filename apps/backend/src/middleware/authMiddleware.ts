import { Request , Response , NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/jwtUtils";
import { getUser } from "../controller/db";

export interface AuthRequest extends Request{
    userId? : string
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    try {
        if (!token) {
            res.status(401).json({ error: "Unauthorized: No token provided" });
            return;
        }

        try {
            const decoded = verifyToken(token);
            if(!decoded || !decoded.userId){
                res.status(401).json({ error : "Invalid token!" });
            }

            const user = await getUser(decoded.userId);
            if(!user || user === null){
                res.status(401).json({ error : "Unauthorized!!" });
                return;
            }

            req.userId = user.userId;
            next();
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

    } catch (err) {
        console.error("token , Unexpected error in authMiddleware:", token , err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};