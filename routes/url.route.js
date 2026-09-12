import express from "express";
import {
    generateNewShortURL,
    redirectURL,
    handleAnalytics,
    deleteShortURL,
} from "../controller/url.controller.js";

// Routes used by logged-in users to manage their short URLs.
const urlRouter = express.Router();
urlRouter.post("/", generateNewShortURL);
urlRouter.delete("/:shortId", deleteShortURL);
urlRouter.get("/:shortId/analytics", handleAnalytics);

// Public route used when someone opens a short URL.
const redirectRouter = express.Router();
redirectRouter.get("/:shortId", redirectURL);

export { urlRouter, redirectRouter };



