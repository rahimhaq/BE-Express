import { Router } from "express";
import { createPost, deletePost, getPost, listPosts, updatePost } from "../controllers/postPrismaController";
const router = Router();
router.get("/", listPosts);
router.get("/:id", getPost);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
export default router;
