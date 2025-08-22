import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";
import { AppError } from "../utils/AppError";

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) throw new AppError("Invalid user id", 400);

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, points: true }
    });
    if (!user) throw new AppError("User tidak ditemukan", 404);

    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const addPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { amount } = req.body as { amount: number };
    if (Number.isNaN(id)) throw new AppError("Invalid user id", 400);
    if (typeof amount !== "number" || amount <= 0) throw new AppError("amount harus > 0", 400);

    const user = await prisma.user.update({
      where: { id },
      data: { points: { increment: amount } },
      select: { id: true, name: true, points: true }
    });

    res.json({ success: true, message: "Top up poin berhasil", data: user });
  } catch (err) { next(err); }
};
