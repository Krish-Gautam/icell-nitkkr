

import express from "express"
import {
  getBlogs,
  getAllBlogsAdmin,
  getBlogById,
  createBlog,
  patchBlogStatus,
} from "../controllers/blogController.js"
import verifyUser from "../middleware/authMiddleware.js"
import { isAdmin } from "../middleware/adminMiddleware.js"

const router = express.Router()


router.get("/admin/all", verifyUser, isAdmin, getAllBlogsAdmin)
router.post("/", verifyUser, createBlog)
router.patch("/:id/status", verifyUser, isAdmin, patchBlogStatus)
router.get("/", getBlogs)
router.get("/:id", getBlogById)

export default router