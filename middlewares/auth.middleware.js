import { getUser } from "../service/auth.service.js";

const restrictToAuthenticatedUsers = (req, res, next) => {
  const user = getUser(req.cookies?.uid);
  if (!user) {
    return res.redirect("/login");
  }

  req.user = user;
  next();
};

const checkAuth = (req, res, next) => {
  req.user = getUser(req.cookies?.uid);
  next();
};

export { restrictToAuthenticatedUsers, checkAuth };
