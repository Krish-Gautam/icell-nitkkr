// import supabase from "../services/supabaseClient.js"

// const verifyUser = async (req, res, next) => {

//   const token = req.headers.authorization?.split(" ")[1]

//   if (!token) {
//     return res.status(401).json({ error: "No token provided" })
//   }

//   const { data, error } = await supabase.auth.getUser(token)

//   if (error) {
//     return res.status(401).json({ error: "Invalid token" })
//   }

//   req.user = data.user
//   next()
// }

// export default verifyUser








import supabase from "../services/supabaseClient.js"

const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" })
  }

  const token = authHeader.split(" ")[1]

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ error: "Invalid token format" })
  }

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", data.user.id)
    .single()

  req.user = {
    ...data.user,
    role: profile?.role || "member",
    name: profile?.name || "",
  }

  next()
}

export default verifyUser