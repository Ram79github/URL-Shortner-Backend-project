import fs from "fs";
import path from "path";
import User from "../models/user.model.js";
import { setUser } from "../service/auth.service.js";
import { uploadsDir } from "../middlewares/upload.middleware.js";

const normalizeEmail = (email) => email?.trim().toLowerCase();

const handleUserSignUp = async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    await User.create({ fullname: name, email, password });
    return res.render("login", { message: "Account created. Please log in." });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("User signup failed:", error);
    return res.status(500).json({ message: "Unable to create account." });
  }
};

const handleLogin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.render("login", { message: "Invalid email or password." });
    }

    const token = setUser(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.redirect("/");
  } catch (error) {
    console.error("User login failed:", error);
    return res.status(500).json({ message: "Unable to login." });
  }
};

const handleLogout = (req, res) => {
  res.clearCookie("token");
  return res.redirect("/login");
};

/**
 * Upload / replace profile image.
 * Expects multipart form field name: profileImg
 */
const handleProfileUpload = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Please log in first." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please select an image to upload." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Delete old profile image file if it exists on disk
    if (user.profileImg) {
      const oldFilename = path.basename(user.profileImg);
      const oldPath = path.join(uploadsDir, oldFilename);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.warn("Could not delete old profile image:", err.message);
        }
      }
    }

    // Store relative path served by Express static
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    user.profileImg = imageUrl;
    await user.save();

    // Refresh JWT so subsequent requests can carry updated info if needed
    const token = setUser(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Support both form redirect and fetch/API clients
    if (req.headers.accept?.includes("application/json") || req.xhr) {
      return res.json({
        message: "Profile image updated.",
        profileImg: imageUrl,
      });
    }

    return res.redirect("/profile?success=1");
  } catch (error) {
    console.error("Profile upload failed:", error);

    // Clean up newly uploaded file on failure
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (_) {}
    }

    if (error.message?.includes("Only image files")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Image must be under 2 MB." });
    }

    return res.status(500).json({ message: "Unable to upload profile image." });
  }
};

/**
 * Remove profile image: delete local file + clear DB field.
 * Storage stays local (uploads/profiles) — no Cloudinary.
 */
const handleRemoveProfileImage = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.redirect("/login");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.redirect("/login");
    }

    if (user.profileImg) {
      const filename = path.basename(user.profileImg);
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn("Could not delete profile image file:", err.message);
        }
      }
      user.profileImg = undefined;
      await user.save();
    }

    const token = setUser(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect("/profile?success=1");
  } catch (error) {
    console.error("Remove profile image failed:", error);
    return res.redirect("/profile?error=Unable to remove photo");
  }
};

/**
 * Render profile page with full user document from DB.
 */
const handleGetProfile = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.redirect("/login");
    }

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.redirect("/login");
    }

    return res.render("profile", {
      user: user.toObject(),
      success: req.query.success === "1",
      error: req.query.error || null,
    });
  } catch (error) {
    console.error("Get profile failed:", error);
    return res.status(500).send("Unable to load profile.");
  }
};

/**
 * Update name (and optionally other fields later).
 */
const handleUpdateProfile = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.redirect("/login");
    }

    const name = req.body?.name?.trim();
    if (!name) {
      return res.redirect("/profile?error=Name is required");
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullname: name },
      { new: true }
    );

    if (!user) {
      return res.redirect("/login");
    }

    const token = setUser(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect("/profile?success=1");
  } catch (error) {
    console.error("Update profile failed:", error);
    return res.redirect("/profile?error=Unable to update profile");
  }
};

export {
  handleUserSignUp,
  handleLogin,
  handleLogout,
  handleProfileUpload,
  handleRemoveProfileImage,
  handleGetProfile,
  handleUpdateProfile,
};
