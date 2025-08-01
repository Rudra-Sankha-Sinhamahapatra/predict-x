import { config } from "../config";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "Authorization header missing or invalid format"
            });
        }

        const token = authHeader.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({
                message: "Token missing"
            });
        }

        const payload = jwt.verify(token, config.server.jwt) as JwtPayload;

        if (!payload || !payload.id) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        req.userId = payload.id;
        next();
        
    } catch (error: any) {
        console.error("Authentication error:", error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token expired"
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};