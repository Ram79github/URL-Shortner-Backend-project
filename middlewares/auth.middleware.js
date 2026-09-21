import { getUser } from "../service/auth.service.js";

<<<<<<< HEAD
const restrictToAuthenticatedUsers = (req, res, next) => {
  const userUid = req?.headers["Authorization"];
  console.log(req.headers)
  if (!userUid) return res.redirect("/login");
  const token = userUid.split(" ")[1];
  const user = getUser(token);

  if (!user) {
    return res.redirect("/login");
  }

  req.user = user;
  next();
};

const checkAuth = (req, res, next) => {
  console.log(req.headers)
  const userUid = req?.headers["authorization"];
  const token = userUid?.split(" ")[1];
  req.user = token ? getUser(token) : null;
  next();
};

export { restrictToAuthenticatedUsers, checkAuth };
=======
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
>>>>>>> Feature
