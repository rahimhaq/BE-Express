import { Request, Response } from "express";
import { prisma } from "../prisma";

/**
 * GET /api/posts
 * Filter: category
 * Pagination (opsional): limit, offset
 */
export const listPosts = async (req: Request, res: Response) => {
  const { category, limit, offset } = req.query as Record<string, string>;
  const take = Math.min(Number(limit ?? 10), 100);
  const skip = Number(offset ?? 0);
  const where = category ? { category } : undefined;

  const [data, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { author: true },
      orderBy: { createdAt: "desc" },
      skip, take,
    }),
    prisma.post.count({ where }),
  ]);

  res.json({ success: true, meta: { total, limit: take, offset: skip }, data });
};

// (CRUD dasar tetap tersedia)
export const getPost = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
  const p = await prisma.post.findUnique({ where: { id }, include: { author: true } });
  if (!p) return res.status(404).json({ success: false, message: "Post not found" });
  res.json({ success: true, data: p });
};

export const createPost = async (req: Request, res: Response) => {
  const { title, content, authorId, published, category } = req.body || {};
  if (!title || !content || typeof authorId !== "number") {
    return res.status(400).json({ success: false, message: "title, content, authorId:number wajib" });
  }
  const exists = await prisma.user.findUnique({ where: { id: authorId } });
  if (!exists) return res.status(404).json({ success: false, message: "Author not found" });

  const p = await prisma.post.create({
    data: { title, content, authorId, published: !!published, category: category ?? "general" }
  });
  res.status(201).json({ success: true, data: p });
};

export const updatePost = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
  const { title, content, published, category, authorId } = req.body || {};
  try {
    const p = await prisma.post.update({
      where: { id },
      data: { title, content, published, category, authorId }
    });
    res.json({ success: true, data: p });
  } catch {
    res.status(404).json({ success: false, message: "Post not found" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
  try {
    await prisma.post.delete({ where: { id } });
    res.json({ success: true, message: "Post deleted" });
  } catch {
    res.status(404).json({ success: false, message: "Post not found" });
  }
};
