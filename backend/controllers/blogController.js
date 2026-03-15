

import {
  fetchApprovedBlogs,
  fetchAllBlogs,
  fetchBlogById,
  insertBlog,
  updateBlogStatus,
} from "../models/blogModel.js"

// GET /api/blogs — public, approved only
export const getBlogs = async (req, res) => {
  try {
    const { data, error } = await fetchApprovedBlogs()
    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
}

// GET /api/blogs/admin — admin only, all blogs
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const { data, error } = await fetchAllBlogs()
    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
}

// GET /api/blogs/:id — public
export const getBlogById = async (req, res) => {
  try {
    const { data, error } = await fetchBlogById(req.params.id)
    if (error) return res.status(404).json({ error: "Blog not found" })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
}

// POST /api/blogs — authenticated user submits blog (status = pending)
export const createBlog = async (req, res) => {
  try {
    const { title, description, content, category, author, links, image } = req.body

    if (!title || !content || !category || !author) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const blogData = {
      title,
      description: description || null,
      content,
      category,
      author,
      links: links || null,
      image: image || null,
      status: "pending",           // always starts as pending
      date: new Date().toISOString().split("T")[0],
    }

    const { data, error } = await insertBlog(blogData)
    if (error) return res.status(400).json({ error: error.message })

    res.status(201).json({ message: "Blog submitted for review", blog: data })
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
}

// PATCH /api/blogs/:id/status — admin only
export const patchBlogStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" })
    }

    const { data, error } = await updateBlogStatus(req.params.id, status)
    if (error) return res.status(400).json({ error: error.message })

    res.json({ message: `Blog ${status}`, blog: data })
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
}