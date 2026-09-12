import express from "express";
import dotenv from "dotenv";
import dns from "dns";
import path from "path";
import cookieParser from "cookie-parser";

// Import routers for URL management, authentication, pages, and redirects.
import { urlRouter, redirectRouter } from "./routes/url.route.js";
import staticRouter from "./routes/static.routes.js";
import { userRouter } from "./routes/user.route.js";
import {
  restrictToAuthenticatedUsers,
  checkAuth,
} from "./middlewares/auth.middleware.js";

dotenv.config({ path: "./.env" });
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

// Read form data, JSON, and cookies.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Configure EJS pages.
app.set("views", path.resolve("./views"));
app.set("view engine", "ejs");

// Routes that need a logged-in user.
app.use("/urls", restrictToAuthenticatedUsers, urlRouter);

// Signup and login actions.
app.use("/user", userRouter);

// Pages can be viewed by anyone, but the home page uses req.user when available.
app.use("/", checkAuth, staticRouter);

// Keep old signup bookmarks working.
app.get("/auth/user/signup", (_req, res) => res.redirect("/signup"));

// Public short-link redirects must be registered last.
app.use("/", redirectRouter);

export default app;