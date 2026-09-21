<<<<<<< HEAD
/*this session based authenticatin this logic is used when ever we want short acccess
const sessionIdToUserMap = new Map();

function setUser(sessionId, user) {
    sessionIdToUserMap.set(sessionId, user);
}

function getUser(sessionId) {
    return sessionIdToUserMap.get(sessionId);
}
*/
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({
   path: "./.env"
   });

 // This is Jwt based authentication
const secretKey = process.env.SECRET_KEY


function setUser(user){
    if(!secretKey) return console.error("secret_key is not found")
 return jwt.sign({
    _id:user._id,
    email:user.email
 },secretKey)
}

function getUser(token){
    if(!token) return null;
    return jwt.verify(token,secretKey)
}




=======
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
>>>>>>> Feature

export { setUser, getUser };
