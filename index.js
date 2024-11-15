import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import blogRoutes from "./routes/blog.route.js";
import MCQRoutes from "./routes/MCQ.route.js";
import commentRouter from "./routes/comment.route.js";
import eventRouter from "./routes/event.route.js";
import sadhanaFormRouter from "./routes/sadhanaform.route.js";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB");
    console.log(process.env.MONGO);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Stop the server on database connection error
  });

const __dirname = path.resolve();
const app = express();

// app.use(cors());
// Access to XMLHttpRequest at 'http://localhost:5000/api/form' from origin 'http://localhost:5001' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.

app.use(
  cors({
    origin: process.env.FRONTEND_URL?? "http://localhost:5001",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "dist")));

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/comment", commentRouter);
app.use("/api/blog", blogRoutes);
app.use("/api/mcq", MCQRoutes);
app.use("/api/event", eventRouter);
app.use("/api/form", sadhanaFormRouter);

// 404 handler for API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    statusCode: 404,
  });
});

// Serve the frontend's index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});

app.listen(5000, () => {
  console.log("Server listening on port 3000");
});
