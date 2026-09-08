import { nanoid } from "nanoid";
import { URL } from "../models/url.model.js";

const formatDateToIST = (date) => new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "long"
}).format(new Date(date));

const formatURLDates = (urlDocument) => {
    const urlData = urlDocument.toObject();

    return {
        ...urlData,
        createdAt: formatDateToIST(urlData.createdAt),
        updatedAt: formatDateToIST(urlData.updatedAt),
        visitHistory: urlData.visitHistory.map((visit) => ({
            ...visit,
            timestamp: formatDateToIST(visit.timestamp)
        }))
    };
};



//generate new shorted url using original url ex https://www.goggle.com

const generateNewShortURL = async (req, res) => {
    const originalURL = req.body?.url?.trim();

    if (!originalURL) {
        return res.status(400).json({ error: "URL is required." });
    }

    try {
        const parsedURL = new globalThis.URL(originalURL);
        if (!["http:", "https:"].includes(parsedURL.protocol)) {
            return res.status(400).json({ error: "URL must use HTTP or HTTPS." });
        }

        const shortId = nanoid(8);
        const shortenedURL = await URL.create({
            shortId,
            redirectURL: parsedURL.toString(),
            visitHistory: []
        });

        return res.status(201).json({
            message: "URL generated successfully.",
            shortenedURL: formatURLDates(shortenedURL)
        });
    } catch (error) {
        return res.status(500).json({ error: "Unable to create shortened URL." });
    }
};
// redirect to original url when user click on short url ex http://localhost:3000/shortId 
const redirectURL = async (req, res) => {
    try {
        const dbEntry = await URL.findOneAndUpdate(
            { shortId: req.params.shortId },
            {
                $push: {
                    visitHistory: {
                        timestamp: new Date()
                    }
                }
            },
            { returnDocument: 'after' },
            {new:true}
        );

        if (!dbEntry) {
            return res.status(404).json({ error: "Short URL not found." });
        }

        return res.redirect(dbEntry.redirectURL);
    } catch (error) {
        return res.status(500).json({ error: "Unable to redirect URL." });
    }
};
//to get how many users visit on a new short url(click)

const handleAnalytics = async (req, res) => {
    try {
        const shortId = req.params?.shortId;
        const result = await URL.findOne({ shortId });

        if (!result) {
            return res.status(404).json({ message: "Short URL not found." });
        }

        return res.status(200).json({
            click: result.visitHistory.length,
            analytics: result.visitHistory,
            message: "Analytics fetched successfully"
        });
    } catch (err) {
        return res.status(500).json({ message: "failed to fetch analytics", error: err });
    }
};






export {
    generateNewShortURL,
    redirectURL,
    handleAnalytics
};