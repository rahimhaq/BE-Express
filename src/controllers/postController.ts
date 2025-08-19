import { Request, Response } from "express";
import { PostModel } from "../models/post";

export const getPosts = (req: Request, res: Response) => {
  const data = PostModel.findAll();
  return res.status(200).json({ success: true, count: data.length, data });
};

export const getPostById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });

  const post = PostModel.findById(id);
  if (!post) return res.status(404).json({ success: false, message: "Post not found" });

  return res.status(200).json({ success: true, data: post });
};

export const createPost = (req: Request, res: Response) => {
  const { title, body, author } = req.body || {};
  if (!title || !body) {
    return res.status(400).json({ success: false, message: "title dan body wajib diisi" });
  }
  const newPost = PostModel.create({ title, body, author });
  return res.status(201).json({ success: true, data: newPost });
};

export const deletePost = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });

  const deleted = PostModel.delete(id);
  if (!deleted) return res.status(404).json({ success: false, message: "Post not found" });

  return res.status(200).json({ success: true, message: "Post deleted" });
};
