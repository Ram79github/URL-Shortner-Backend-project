import express from "express";
import dotenv from "dotenv";
import {urlRouter, redirectRouter } from "./routes/url.route.js";
import dns from "dns"

const app = express();
dotenv.config(
  {
    path: "./.env"
  }
);
// dns changes to avoid dns lookup issues in some environments
dns.setServers(["1.1.1.1","8.8.8.8"]);

//middleware section
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//routes
app.use("/url",urlRouter);
app.use("/",redirectRouter)
export default app;