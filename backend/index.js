// import dotenv from "dotenv"
// dotenv.config()

// import express from "express"
// import cors from "cors"
// import helmet from "helmet"
// import rateLimit from "express-rate-limit"

// import teamRoutes from "./routes/teamRoutes.js"
// import blogRoutes from "./routes/blogRoutes.js"
// import authRoutes from "./routes/authRoutes.js"


// const app = express()

// app.use(helmet())

// const limiter = rateLimit({
//  windowMs: 15 * 60 * 1000,
//  max: 100
// })

// app.use(limiter)

// app.use(cors({
//  origin: process.env.FRONTEND_URL
// }))

// app.use(express.json())

// app.use("/api/auth", authRoutes)
// app.use("/api/blogs", blogRoutes)
// app.use("/api/auth", authRoutes)
// app.use("/teams", teamRoutes)

// app.listen(process.env.PORT,()=>{
//  console.log(`Server running on port ${process.env.PORT}`)
// })












import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

import teamRoutes from "./routes/teamRoutes.js"
import blogRoutes from "./routes/blogRoutes.js"
import authRoutes from "./routes/authRoutes.js"

const app = express()

app.use(helmet())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})

app.use(limiter)

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}))

// ✅ Increase limit for base64 image uploads
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// ✅ Fixed: no duplicate authRoutes, fixed /teams prefix
app.use("/api/auth", authRoutes)
app.use("/api/blogs", blogRoutes)
app.use("/api/teams", teamRoutes)

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`)
})