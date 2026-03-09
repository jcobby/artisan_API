import { Request, Response } from "express";
import { supabase } from "../config/supabase";
// import { prisma } from "../config/prisma";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
        res.status(400).send('Name, email, phone and password are required');
        return;
    }
    try {
        const { data: { user }, error } = await supabase.auth.signUp({ email, password })
        if (error) return res.status(401).json({ error: error.message })
        if (!user?.id) throw new Error("Supabase user not created");
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const prismaUser = await prisma.user.create({
            data: {
                id: user.id,
                name,
                email,
                phone,
                role: "CLIENT",
                password: hashedPassword,
                updatedAt: new Date() 
            }
        })
        res.status(201).json(prismaUser);
    } catch (error: any) {
        res.status(500).send('An error occurred while creating the user');
        return;
    }
}

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).send('Email and password are required');
        return;
    }
    try {
        const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error || !session) return res.status(401).json({ error: 'Invalid credentials' });
        const prismaUser = await prisma.user.findUnique({ where: { id: session.user.id } })
        if (!prismaUser) {
            return res.status(404).send('User not found'); 
        }
        const hashedPassword = prismaUser?.password;
        const isPasswordValid = await bcrypt.compare(password, hashedPassword!)
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.status(200).json({
            message: "Login successful",
            admin: {
                id: prismaUser.id,
                name: prismaUser.name,
                email: prismaUser.email
            },
            accessToken: session?.access_token,
            refreshToken: session?.refresh_token,
        });
    } catch (error: any) {
        res.status(500).send('An error occurred while logging in');
        return;
    }
}

export const logoutUser = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const { error } = await supabase.auth.signOut()
        if (error) return res.status(400).json({ error: error.message });

        res.status(200).send('User logged out successfully');
    } catch (error: any) {
        console.error(error);
        res.status(500).send('An error occurred while logging out');
        return;
    }
}

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany()
        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).send('An error occurred while fetching users');
        return;
    }
}

export const getArtisans = async (req: Request, res: Response) => {
}

export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({ id })
        if (!user) {
            res.status(404).send('User not found');
            return;
        }
        res.status(200).json(user);
    } catch (error: any) {
        res.status(400).send('Invalid user ID');
        return;
    }
}

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        res.send(`Update user with id ${req.params.id}`);
    } catch (error: any) {
        res.status(400).send('Invalid user ID');
        return;
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // await prisma.user.delete({ id })
    } catch (error: any) {
        res.status(400).send('Invalid user ID');
        return;
    }
}

