import express from 'express'
import cors from "cors"
import path, { dirname } from "path"
import { fileURLToPath } from 'url'
import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"


const app = express()
const PORT = process.env.PORT || 5050

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(cors())
app.use(express.json())

// Use routes
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)

app.use(express.static(path.join(__dirname, "../frontend/dist")))
app.get('*', (req, res) => {
    console.log("Serving react file: ", path.join(__dirname, "../frontend/dist/index.html"))
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
});


app.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`)
})

