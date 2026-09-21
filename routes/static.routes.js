import express from "express";
import { URL } from "../models/url.model.js";
<<<<<<< HEAD

const pageRouter = express.Router();

pageRouter.get("/", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  const urls = await URL.find({ createdBy: req.user._id });
  return res.render("home", { urls });
});

=======
import User from "../models/user.model.js";
import { restrictTo } from "../middlewares/auth.middleware.js";
import { handleGetProfile } from "../controller/user.controller.js";

const pageRouter = express.Router();

/** Load full user from DB so views get profileImg, fullname, etc. */
async function loadFullUser(req) {
  if (!req.user?._id) return req.user;
  try {
    const dbUser = await User.findById(req.user._id).select("-password");
    return dbUser ? dbUser.toObject() : req.user;
  } catch {
    return req.user;
  }
}

pageRouter.get("/admin/urls", restrictTo(["ADMIN"]), async (req, res) => {
  const urls = await URL.find({}).sort({ createdAt: -1 });
  const user = await loadFullUser(req);
  return res.render("home", { urls, user });
});

pageRouter.get("/", restrictTo(["NORMAL", "ADMIN"]), async (req, res) => {
  const urls = await URL.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
  const user = await loadFullUser(req);
  return res.render("home", { urls, user });
});

pageRouter.get("/profile", restrictTo(["NORMAL", "ADMIN"]), handleGetProfile);

>>>>>>> Feature
pageRouter.get("/signup", (_req, res) => {
  return res.render("signup");
});

pageRouter.get("/login", (_req, res) => {
  return res.render("login");
});

export default pageRouter;
