import type { NextFunction, Request, Response } from "express";
import { findUserById, verifyAccessToken } from "../modules/auth/auth.services";

const publicPaths = new Set([
  "/health",
  "/api/auth/register",
  "/api/auth/login",
]);

export const authorizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (publicPaths.has(req.path)) {
    next();
    return;
  }

  const authorization = req.headers["authorization"];
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "Authorization token is required" });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await findUserById(Number(payload.sub));

    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "User no longer exists" });
      return;
    }

    req.user = { id: user.id, email: user.email, username: user.username };
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authorization token",
    });
  }
};
