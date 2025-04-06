import jwt from 'jsonwebtoken';

interface TokenPayload {
    userId : string
}

export const  generateToken = (payload : TokenPayload) : string => {
    return jwt.sign(payload , process.env.JWT_SECRET ?? 'SECRET');
}

export const verifyToken = (token : string) : TokenPayload => {
    return jwt.verify(token, process.env.JWT_SECRET ?? 'SECRET') as TokenPayload;
}