import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const secretKey = process.env.SECRET_KEY?.trim();

if (!secretKey) {
  throw new Error("SECRET_KEY is missing from .env");
}

function setUser(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
      fullname: user.fullname,
      profileImg: user.profileImg || null,
    },
    secretKey
  );
}

function getUser(token) {
  if (!token) return null;
  return jwt.verify(token, secretKey);
}

export { setUser, getUser };
