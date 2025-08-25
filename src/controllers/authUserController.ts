import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signJwt } from "../utils/jwt";
import { encrypt } from "../utils/crypto";
import crypto from "crypto";
import { AppError } from "../utils/AppError";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6)
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, password } = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ success: false, message: "Email sudah digunakan" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, role: "USER" }
    });
    res.status(201).json({ success: true, data: { id: user.id, email: user.email } });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = signJwt({ id: user.id, email: user.email, role: user.role });
    res.json({ success: true, token });
  } catch (err) { next(err); }
};

export const createPasswordResetToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("User tidak ditemukan", 404);

    const raw = crypto.randomBytes(32).toString("hex");
    const tokenEnc = encrypt(raw);
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 menit

    await prisma.user.update({
      where: { id: user.id },
      data: { resetTokenEnc: tokenEnc, resetTokenExp: expires }
    });

    res.json({ success: true, resetToken: raw, expiresAt: expires });
  } catch (err) { next(err); }
};
