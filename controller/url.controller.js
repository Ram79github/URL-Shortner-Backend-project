import { nanoid } from "nanoid";
import { URL as UrlModel } from "../models/url.model.js";
import User from "../models/user.model.js";

const loadFullUser = async (req) => {
    if (!req.user?._id) return req.user;
    try {
        const dbUser = await User.findById(req.user._id).select("-password");
        return dbUser ? dbUser.toObject() : req.user;
    } catch {
        return req.user;
    }
};

const renderHomeWithUrls = async (res, req, extra = {}) => {
    const urls = await UrlModel.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    const user = await loadFullUser(req);
    return res.render("home", {
        urls,
        user,
        ...extra,
    });
};

const generateNewShortURL = async (req, res) => {
    const originalURL = req.body?.url?.trim();
    let normalizedURL;

    if (!originalURL) {
        return res.status(400).json({ error: "URL is required." });
    }

    try {
        const parsedURL = new globalThis.URL(originalURL);
        if (!["http:", "https:"].includes(parsedURL.protocol)) {
            return res.status(400).json({ error: "URL must use HTTP or HTTPS." });
        }

        normalizedURL = parsedURL.toString();
        const existingURL = await UrlModel.findOne({ redirectURL: normalizedURL });
        if (existingURL) {
            return renderHomeWithUrls(res, req, {
                shortenedURL: existingURL.toObject(),
                duplicateURL: true,
            });
        }

        const shortenedURL = await UrlModel.create({
            shortId: nanoid(8),
            redirectURL: normalizedURL,
            visitHistory: [],
            createdBy: req.user._id,
        });

        return renderHomeWithUrls(res, req, {
            shortenedURL: shortenedURL.toObject(),
            duplicateURL: false,
        });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern?.redirectURL) {
            const existingURL = await UrlModel.findOne({ redirectURL: normalizedURL });
            if (existingURL) {
                return renderHomeWithUrls(res, req, {
                    shortenedURL: existingURL.toObject(),
                    duplicateURL: true,
                });
            }
        }

        return res.status(500).json({ error: "Unable to create shortened URL." });
    }
};

const redirectURL = async (req, res) => {
    try {
        const url = await UrlModel.findOneAndUpdate(
            { shortId: req.params.shortId },
            { $push: { visitHistory: { timestamp: new Date() } } },
            { returnDocument: "after" }
        );

        if (!url) {
            return res.status(404).json({ error: "Short URL not found." });
        }

        return res.redirect(url.redirectURL);
    } catch (error) {
        return res.status(500).json({ error: "Unable to redirect URL." });
    }
};

const handleAnalytics = async (req, res) => {
    try {
        const url = await UrlModel.findOne({
            shortId: req.params.shortId,
            createdBy: req.user._id,
        });

        if (!url) {
            return res.status(404).json({ message: "Short URL not found." });
        }

        return res.json({
            click: url.visitHistory.length,
            analytics: url.visitHistory,
            message: "Analytics fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to fetch analytics.",
            error,
        });
    }
};

const deleteShortURL = async (req, res) => {
    try {
        const deletedURL = await UrlModel.findOneAndDelete({
            shortId: req.params.shortId,
            createdBy: req.user._id,
        });

        if (!deletedURL) {
            return res.status(404).json({ error: "Short URL not found." });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: "Unable to delete shortened URL." });
    }
};

export {
    generateNewShortURL,
    redirectURL,
    handleAnalytics,
    deleteShortURL,
};
