import supabase from "../services/supabaseClient.js"

// Public: only approved blogs
export const fetchApprovedBlogs = async () => {
  return await supabase
    .from("blogs")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
}

// Admin: all blogs
export const fetchAllBlogs = async () => {
  return await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false })
}

export const fetchBlogById = async (id) => {
  return await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single()
}

export const insertBlog = async (blogData) => {
  return await supabase
    .from("blogs")
    .insert([blogData])
    .select()
    .single()
}

export const updateBlogStatus = async (id, status) => {
  return await supabase
    .from("blogs")
    .update({ status })
    .eq("id", id)
    .select()
    .single()
}