import express from "express";
import {
    generateNewShortURL,
    redirectURL,
    handleAnalytics
} from "../controller/url.controller.js";
const router = express.Router();
const redirectRouter = express.Router();

router.post("/", generateNewShortURL);
redirectRouter.get("/:shortId", redirectURL);
router.get("/analytics/:shortId", handleAnalytics);


export { router as urlRouter, redirectRouter };


