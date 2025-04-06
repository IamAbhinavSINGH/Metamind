import { Request , Response , NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/jwtUtils";

export interface AuthRequest extends Request{
    userId? : string // Attach the userId payload after verification
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

        if (!token) {
            res.status(401).json({ error: "Unauthorized: No token provided" });
            return;
        }

        try {
            const decoded = verifyToken(token);
            if(!decoded || !decoded.userId){
                res.status(401).json({ error : "Invalid token!" });
            }

            req.userId = decoded.userId;
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
        console.error("Unexpected error in authMiddleware:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};