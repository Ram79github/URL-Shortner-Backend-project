import express from "express";
import dotenv from "dotenv";
import dns from "dns";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { urlRouter, redirectRouter } from "./routes/url.route.js";
import staticRouter from "./routes/static.routes.js";
import { userRouter } from "./routes/user.route.js";
import {
  restrictTo,
  checkForAuth,
} from "./middlewares/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: "./.env" });
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

// Read form data, JSON, and cookies.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuth);

// Serve uploaded profile images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure EJS pages.
app.set("views", path.resolve("./views"));
app.set("view engine", "ejs");

// Routes that need a logged-in user.
app.use("/urls", restrictTo(["NORMAL", "ADMIN"]), urlRouter);

// Signup, login, logout, profile upload.
app.use("/user", userRouter);

// Pages can be viewed by anyone, but the home page uses req.user when available.
app.use("/", staticRouter);

// Keep old signup bookmarks working.
app.get("/auth/user/signup", (_req, res) => res.redirect("/signup"));

// Public short-link redirects must be registered last.
app.use("/", redirectRouter);

export default app;
