import { Request, Response } from "express";
import { supabase } from "../config/supabase";
// import { prisma } from "../config/prisma";
import { prisma } from "../lib/prisma";
import { sendSms } from "../services/smsService";
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password || !phone) {
        res.status(400).send('Name, email, phone and password are required');
        return;
    }
    try {
        const { data: { user }, error } = await supabase.auth.signUp({ email, password })
        if (error) return res.status(401).json({ error: error.message })
        if (!user?.id) throw new Error("Supabase user not created");
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const prismaUser = await prisma.user.create({
            data: {
                id: user.id,
                name,
                email,
                phone,
                role: role && ['CLIENT', 'ARTISAN'].includes(role) ? role : "CLIENT",
                password: hashedPassword,
                updatedAt: new Date(), // Added updatedAt field
                isPhoneVerified: false,
                phoneOtp: otp,
                phoneOtpExpiresAt: otpExpiresAt
            }
        })
        await sendSms(phone, `Your Artisan verification code is ${otp}`);
        res.status(201).json(prismaUser);
    } catch (error: any) {
        res.status(500).send('An error occurred while creating the user');
        return;
    }
}

export const loginUser = async (req: Request, res: Response) => {
    const { phone, password, role } = req.body;
    if (!phone || !password) {
        res.status(400).send('Phone and password are required');
        return;
    }
    try {
        const prismaUser = await prisma.user.findUnique({ where: { phone } });
        if (!prismaUser) {
            return res.status(404).send('User not found');
        }

        if (!prismaUser.isPhoneVerified) {
            return res.status(403).json({ error: 'Phone number not verified' });
        }

        const hashedPassword = prismaUser.password;
        const isPasswordValid = await bcrypt.compare(password, hashedPassword!);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Determine available roles for this account
        const artisanProfile = await prisma.artisanProfile.findUnique({
            where: { userId: prismaUser.id }
        });
        const availableRoles: ('CLIENT' | 'ARTISAN')[] = ['CLIENT'];
        if (artisanProfile) {
            availableRoles.push('ARTISAN');
        }

        // Determine active role:
        // - if client explicitly sends a valid role, use it
        // - otherwise, default to ARTISAN when both roles are possible
        // - otherwise, default to CLIENT
        let activeRole: 'CLIENT' | 'ARTISAN' = 'CLIENT';
        if (role && (role === 'CLIENT' || role === 'ARTISAN') && availableRoles.includes(role)) {
            activeRole = role;
        } else if (availableRoles.includes('ARTISAN')) {
            activeRole = 'ARTISAN';
        }

        // Persist the active role on the user record so authorization can rely on it
        if (prismaUser.role !== activeRole) {
            await prisma.user.update({
                where: { id: prismaUser.id },
                data: { role: activeRole }
            });
        }

        const { data: { session }, error } = await supabase.auth.signInWithPassword({
            email: prismaUser.email!,
            password
        });
        if (error || !session) return res.status(401).json({ error: 'Invalid credentials' });
        res.status(200).json({
            message: "Login successful",
            admin: {
                id: prismaUser.id,
                name: prismaUser.name,
                email: prismaUser.email,
                role: activeRole
            },
            availableRoles,
            accessToken: session?.access_token,
            refreshToken: session?.refresh_token,
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).send('An error occurred while logging in');
        return;
    }
}

export const verifyOtp = async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).send('Phone and OTP code are required');
    }

    try {
        const prismaUser = await prisma.user.findUnique({ where: { phone } });
        if (!prismaUser || !prismaUser.phoneOtp || !prismaUser.phoneOtpExpiresAt) {
            return res.status(400).json({ error: 'OTP not found. Please request a new code.' });
        }

        const now = new Date();
        if (prismaUser.phoneOtp !== otp || prismaUser.phoneOtpExpiresAt < now) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        await prisma.user.update({
            where: { id: prismaUser.id },
            data: {
                isPhoneVerified: true,
                phoneOtp: null,
                phoneOtpExpiresAt: null
            }
        });

        return res.status(200).json({ message: 'Phone number verified successfully' });
    } catch (error: any) {
        console.error(error);
        return res.status(500).send('An error occurred while verifying OTP');
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

