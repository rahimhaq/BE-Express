import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";
import { AppError } from "../utils/AppError";

export const transferPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromUserId, toUserId, amount } = req.body as {
      fromUserId: number; toUserId: number; amount: number;
    };

    // Validasi
    if (!fromUserId || !toUserId || typeof amount !== "number") {
      throw new AppError("fromUserId, toUserId, amount wajib diisi", 400);
    }
    if (amount <= 0) throw new AppError("Jumlah poin harus lebih dari 0", 400);
    if (fromUserId === toUserId) throw new AppError("Pengirim dan penerima tidak boleh sama", 400);

    // Satu transaksi atomic
    const result = await prisma.$transaction(async (tx) => {
      const [from, to] = await Promise.all([
        tx.user.findUnique({ where: { id: fromUserId } }),
        tx.user.findUnique({ where: { id: toUserId } }),
      ]);
      if (!from || !to) throw new AppError("User tidak ditemukan", 404);

      if (from.points < amount) throw new AppError("Poin tidak mencukupi", 400);

      const [updatedFrom, updatedTo] = await Promise.all([
        tx.user.update({ where: { id: fromUserId }, data: { points: { decrement: amount } } }),
        tx.user.update({ where: { id: toUserId }, data: { points: { increment: amount } } }),
      ]);

      const transfer = await tx.transfer.create({
        data: { fromUserId, toUserId, amount },
      });

      return { updatedFrom, updatedTo, transfer };
    });

    res.status(201).json({ success: true, message: "Transfer berhasil", data: result });
  } catch (err) {
    next(err);
  }
};
