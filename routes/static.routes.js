import express from "express";
import { URL } from "../models/url.model.js";

const pageRouter = express.Router();

pageRouter.get("/", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  const urls = await URL.find({ createdBy: req.user._id });
  return res.render("home", { urls });
});

pageRouter.get("/signup", (_req, res) => {
  return res.render("signup");
});

pageRouter.get("/login", (_req, res) => {
  return res.render("login");
});

export default pageRouter;
