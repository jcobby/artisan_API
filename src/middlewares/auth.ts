import { NextFunction, Request, Response } from "express";
import { supabase } from "../config/supabase";

export interface AuthenticatedRequest extends Request {
    user: { id: string, email: string };
}

export async function authenticate (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({error: 'No token provided'});
        }
        const {data:{user}, error} = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({error: 'Invalid token'});
        }
        req.user = { id: user.id, email: user.email || '' };
        next(); 
    } catch (error: any) {
        res.status(401).send('Unauthorized');
        return;
    }
}