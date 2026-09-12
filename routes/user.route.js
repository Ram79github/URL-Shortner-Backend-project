import express from "express";
import { handleLogin, handleUserSignUp } from "../controller/user.controller.js";

const userRouter = express.Router();

userRouter.post("/signup", handleUserSignUp);
userRouter.post("/login", handleLogin);

export { userRouter };