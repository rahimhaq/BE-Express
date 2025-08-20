import { Request, Response } from "express";
import { prisma } from "../prisma";

export const listUsers = async (_: Request, res: Response) => {
  const data = await prisma.user.findMany({ orderBy: { id: "asc" } });
  res.json({ success: true, count: data.length, data });
};

export const getUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: u });
};

export const createUser = async (req: Request, res: Response) => {
  const { email, name } = req.body || {};
  if (!email || !name) return res.status(400).json({ success: false, message: "email & name wajib" });
  try {
    const u = await prisma.user.create({ data: { email, name } });
    res.status(201).json({ success: true, data: u });
  } catch {
    res.status(409).json({ success: false, message: "Email already exists" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
  const { email, name } = req.body || {};
  try {
    const u = await prisma.user.update({ where: { id }, data: { email, name } });
    res.json({ success: true, data: u });
  } catch {
    res.status(404).json({ success: false, message: "User not found or email taken" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: "User deleted" });
  } catch {
    res.status(404).json({ success: false, message: "User not found" });
  }
};
