import express from "express";
import {URL} from "../models/url.model.js";

const router = express.Router();

//static router declaration

router.get("/", async (_req, res) => {
    // getting all urls 
  const allUrls = await URL.find({});
  return res.render("home", 
    { urls: allUrls }
);
});

export default router;
