import { Request, Response } from "express";
import { prisma } from "../prisma";

/**
 * GET /api/orders/summary
 * Grouping jumlah pesanan per user + Pagination + optional filter minCount
 * Query: limit, offset, minCount
 */
export const ordersSummary = async (req: Request, res: Response) => {
  const { limit, offset, minCount } = req.query as Record<string, string>;
  const take = Math.min(Number(limit ?? 10), 100);
  const skip = Number(offset ?? 0);
  const min = Number(minCount ?? 0);

  const grouped = await prisma.order.groupBy({
    by: ["userId"],
    _count: { id: true },
    orderBy: { userId: "asc" },
    skip, take,
  });

  const filtered = grouped.filter(g => g._count.id >= min);
  const userIds = filtered.map(f => f.userId);
  const users = await prisma.user.findMany({ where: { id: { in: userIds } } });
  const uMap = new Map(users.map(u => [u.id, u.name]));

  res.json({
    success: true,
    meta: { limit: take, offset: skip, count: filtered.length },
    data: filtered.map(g => ({
      userId: g.userId,
      userName: uMap.get(g.userId) ?? "(unknown)",
      ordersCount: g._count.id,
    })),
  });
};
