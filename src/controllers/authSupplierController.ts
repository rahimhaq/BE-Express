import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signJwt } from "../utils/jwt";
import { encrypt } from "../utils/crypto";

const supplierRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  taxId: z.string().min(4).optional(),
  bankAcc: z.string().min(6).optional()
});

export const supplierRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, taxId, bankAcc } = supplierRegisterSchema.parse(req.body);
    const exists = await prisma.supplier.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ success: false, message: "Email supplier sudah digunakan" });

    const passwordHash = await bcrypt.hash(password, 10);
    const supplier = await prisma.supplier.create({
      data: {
        name, email, passwordHash,
        taxIdEnc:  taxId  ? encrypt(taxId)  : null,
        bankAccEnc: bankAcc? encrypt(bankAcc): null
      }
    });
    res.status(201).json({ success: true, data: { id: supplier.id, email: supplier.email } });
  } catch (err) { next(err); }
};

export const supplierLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const sup = await prisma.supplier.findUnique({ where: { email } });
    if (!sup) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, sup.passwordHash);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = signJwt({ id: sup.id, email: sup.email, role: "SUPPLIER" });
    res.json({ success: true, token });
  } catch (err) { next(err); }
};
