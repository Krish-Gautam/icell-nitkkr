// import express from "express"
// import { getBlogs, createBlog } from "../controllers/blogController.js"
// import verifyUser from "../middleware/authMiddleware.js"
// import { isAdmin } from "../middleware/adminMiddleware.js"

// const router = express.Router()

// router.get("/", getBlogs)

// router.post("/", verifyUser, isAdmin, createBlog)

// export default router

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

// ✅ RULE: named routes ALWAYS before /:id wildcard
// If "admin" comes after /:id, Express treats "admin" as an ID param

router.get("/admin/all", verifyUser, isAdmin, getAllBlogsAdmin)
router.post("/", verifyUser, createBlog)
router.patch("/:id/status", verifyUser, isAdmin, patchBlogStatus)
router.get("/", getBlogs)
router.get("/:id", getBlogById)

export default router