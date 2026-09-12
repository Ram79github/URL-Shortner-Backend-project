import User from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";
import { setUser } from "../service/auth.service.js";

const normalizeEmail = (email) => email?.trim().toLowerCase();

const startUserSession = (res, user) => {
  const sessionId = uuidv4();
  setUser(sessionId, user);
  res.cookie("uid", sessionId);
};

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

    startUserSession(res, user);
    return res.redirect("/");
  } catch (error) {
    console.error("User login failed:", error);
    return res.status(500).json({ message: "Unable to login." });
  }
};

export { handleUserSignUp, handleLogin };
