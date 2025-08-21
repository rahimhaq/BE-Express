import { Router } from "express";
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postPrismaController";
import {
  listCommentsByPost,
  commentsSummary,
} from "../controllers/commentController";

const router = Router();

// Posts
router.get("/", listPosts);          // filter by category (+pagination)
router.get("/:id", getPost);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

// Comments
router.get("/:id/comments", listCommentsByPost); // pagination
router.get("/comments-summary", commentsSummary);// grouping + pagination + filters

export default router;
