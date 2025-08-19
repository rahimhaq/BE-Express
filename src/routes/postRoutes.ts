import { Router } from "express";
import { createPost, deletePost, getPostById, getPosts } from "../controllers/postController";

const router = Router();

// Read
router.get("/", getPosts);
router.get("/:id", getPostById);

// Create
router.post("/", createPost);

// Delete
router.delete("/:id", deletePost);

export default router;
