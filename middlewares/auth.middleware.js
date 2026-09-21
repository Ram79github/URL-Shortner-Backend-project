import { getUser } from "../service/auth.service.js";

const checkForAuth = (req, _res, next) => {
  try {
    const tokenCookie = req.cookies?.token;
    req.user = null;
    if (!tokenCookie) return next();
    const user = getUser(tokenCookie);
    req.user = user;
    return next();
  } catch (error) {
    req.user = null;
    return next();
  }
};

const restrictTo = (roles) => {
  return function (req, res, next) {
    if (!req.user) {
      return res.redirect("/login");
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).send("Unauthorized");
    }
    return next();
  };
};

export { restrictTo, checkForAuth };
