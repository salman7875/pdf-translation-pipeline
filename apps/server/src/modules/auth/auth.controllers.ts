import type { Request, Response } from "express";
import { db } from "../../prisma/db";
import {
  createAccessToken,
  findUserByEmail,
  hashPassword,
  verifyPassword,
} from "./auth.services";

const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body as {
      email?: unknown;
      username?: unknown;
      password?: unknown;
    };

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      res
        .status(400)
        .json({
          success: false,
          message: "Email and a password of at least 8 characters are required",
        });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await findUserByEmail(normalizedEmail)) {
      res
        .status(409)
        .json({ success: false, message: "Email is already registered" });
      return;
    }

    const user = await db.orm.public.User.create({
      email: normalizedEmail,
      username: typeof username === "string" ? username.trim() || null : null,
      password: await hashPassword(password),
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    res
      .status(201)
      .json({
        success: true,
        data: { user: safeUser, accessToken: createAccessToken(safeUser) },
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: unknown;
      password?: unknown;
    };
    const user =
      typeof email === "string"
        ? await findUserByEmail(email.trim().toLowerCase())
        : null;

    if (
      !user ||
      typeof password !== "string" ||
      !(await verifyPassword(password, user.password))
    ) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
      return;
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    res.json({
      success: true,
      data: { user: safeUser, accessToken: createAccessToken(safeUser) },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      });
  }
};

const me = (req: Request, res: Response) => {
  res.json({ success: true, data: { user: req.user } });
};

export const authController = { register, login, me };
