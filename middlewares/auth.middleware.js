import { getUser } from "../service/auth.service.js";

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
