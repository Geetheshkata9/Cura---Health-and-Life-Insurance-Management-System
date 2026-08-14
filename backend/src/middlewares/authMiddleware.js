import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401);
      return next(new Error('Not authorized, no session found'));
    }

    req.session = session.session;

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      res.status(404);
      return next(new Error('User matching session not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(new Error(`Not authorized: ${error.message}`));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route`));
    }
    next();
  };
};
