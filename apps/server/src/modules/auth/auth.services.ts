import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import jwt from "jsonwebtoken";
import { db } from "../../prisma/db";
import type { AuthTokenPayload, AuthUser } from "./auth.types";

const scrypt = promisify(scryptCallback);

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
};

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
};

export const verifyPassword = async (
  password: string,
  storedPassword: string,
) => {
  const [salt, storedHash] = storedPassword.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const expectedHash = Buffer.from(storedHash, "hex");

  return (
    expectedHash.length === derivedKey.length &&
    timingSafeEqual(expectedHash, derivedKey)
  );
};

export const createAccessToken = (user: AuthUser) =>
  jwt.sign(
    { sub: String(user.id), email: user.email } satisfies AuthTokenPayload,
    getJwtSecret(),
    {
      expiresIn: "1d",
    },
  );

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  const payload = jwt.verify(token, getJwtSecret());

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string"
  ) {
    throw new Error("Invalid access token");
  }

  return { sub: payload.sub, email: payload.email };
};

export const findUserByEmail = (email: string) =>
  db.orm.public.User.where({ email }).first();

export const findUserById = (id: number) =>
  db.orm.public.User.where({ id }).first();
