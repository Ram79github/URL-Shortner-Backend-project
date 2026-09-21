import express from "express";
<<<<<<< HEAD
import { handleLogin, handleUserSignUp } from "../controller/user.controller.js";
=======
import {
  handleLogin,
  handleUserSignUp,
  handleLogout,
  handleProfileUpload,
  handleRemoveProfileImage,
  handleUpdateProfile,
} from "../controller/user.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js";
import { uploadProfileImage } from "../middlewares/upload.middleware.js";
>>>>>>> Feature

const userRouter = express.Router();

userRouter.post("/signup", handleUserSignUp);
userRouter.post("/login", handleLogin);
<<<<<<< HEAD

export { userRouter };
=======
userRouter.post("/logout", handleLogout);

// Profile image upload — stored in local folder uploads/profiles (not Cloudinary)
userRouter.post(
  "/profile/upload",
  restrictTo(["NORMAL", "ADMIN"]),
  (req, res, next) => {
    uploadProfileImage(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.redirect("/profile?error=Image must be under 2 MB");
        }
        return res.redirect(
          `/profile?error=${encodeURIComponent(err.message || "Upload failed")}`
        );
      }
      next();
    });
  },
  handleProfileUpload
);

// Remove profile photo (deletes local file)
userRouter.post(
  "/profile/remove",
  restrictTo(["NORMAL", "ADMIN"]),
  handleRemoveProfileImage
);

// Update profile text fields
userRouter.post(
  "/profile",
  restrictTo(["NORMAL", "ADMIN"]),
  handleUpdateProfile
);

export { userRouter };
>>>>>>> Feature
