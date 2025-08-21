import { Request, Response } from "express";
import { prisma } from "../prisma";

/**
 * GET /api/posts/:id/comments
 * Pagination: limit, offset
 */
export const listCommentsByPost = async (req: Request, res: Response) => {
  const postId = Number(req.params.id);
  if (Number.isNaN(postId)) return res.status(400).json({ success: false, message: "Invalid post id" });

  const { limit, offset } = req.query as Record<string, string>;
  const take = Math.min(Number(limit ?? 10), 100);
  const skip = Number(offset ?? 0);

  const [data, total] = await Promise.all([
    prisma.comment.findMany({ where: { postId }, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.comment.count({ where: { postId } }),
  ]);

  res.json({ success: true, meta: { total, limit: take, offset: skip }, data });
};

/**
 * GET /api/posts/comments-summary
 * Grouping: jumlah komentar per post
 * Query: limit, offset, minComments, category (optional)
 */
export const commentsSummary = async (req: Request, res: Response) => {
  const { limit, offset, minComments, category } = req.query as Record<string, string>;
  const take = Math.min(Number(limit ?? 10), 100);
  const skip = Number(offset ?? 0);
  const min = Number(minComments ?? 0);

  // (opsional) batasi ke kategori tertentu: ambil postId kategori tsb
  let postFilter: number[] | undefined;
  if (category) {
    const posts = await prisma.post.findMany({ where: { category }, select: { id: true } });
    postFilter = posts.map(p => p.id);
    if (postFilter.length === 0) {
      return res.json({ success: true, meta: { total: 0, limit: take, offset: skip }, data: [] });
    }
  }

  const grouped = await prisma.comment.groupBy({
    by: ["postId"],
    _count: { id: true },
    where: postFilter ? { postId: { in: postFilter } } : undefined,
    orderBy: { postId: "asc" },
    skip, take,
  });

  const filtered = grouped.filter(g => g._count.id >= min);
  const postIds = filtered.map(f => f.postId);

  const posts = await prisma.post.findMany({
    where: { id: { in: postIds } },
    select: { id: true, title: true, category: true }
  });
  const pMap = new Map(posts.map(p => [p.id, p]));

  res.json({
    success: true,
    meta: { limit: take, offset: skip, count: filtered.length },
    data: filtered.map(g => ({
      postId: g.postId,
      title: pMap.get(g.postId)?.title ?? "(unknown)",
      category: pMap.get(g.postId)?.category ?? "-",
      commentsCount: g._count.id,
    })),
  });
};
