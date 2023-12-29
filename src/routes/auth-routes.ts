import { db } from "@/utils/db";
import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { object, string } from "valibot";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { compareHash } from "@/utils/encryption";
import { sign, verify } from "hono/jwt";
import { jwtMiddleware } from "../middleware/auth-jwt";
import { setCookie, getCookie } from "hono/cookie";

const authSchema = object({
  username: string(),
  password: string(),
});

const authRoutes = new Hono().basePath("/auth");

authRoutes.post("/login", vValidator("json", authSchema), async (c) => {
  const body = c.req.valid("json");

  //check if user exists
  const user = await db.query.users.findFirst({
    where: eq(users.email, body.username),
  });

  if (!user) {
    return c.json({ ok: false, message: "not found!" }, 404);
  }

  // check if password is correct
  try {
    const res = await compareHash(body.password, user.password);

    if (res) {
      const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60; //15 minute

      const payload = {
        sub: user.email,
        role: user.role,
        exp: expiresAt,
      };

      const token = await sign(payload, process.env.JWT_SECRET as string);

      setCookie(c, "__Session", token, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000,
        expires: new Date(Date.UTC(2000, 11, 24, 10, 30, 59, 900)),
        sameSite: "None",
      });

      return c.json({ ok: true, data: token });
    } else {
      return c.json(
        { ok: "false", message: "username or password doesn't match" },
        403
      );
    }
  } catch (e) {
    return c.json({ ok: false, message: "server error" }, 500);
  }
});

authRoutes.get("/me", async (c) => {
  const token = getCookie(c, "__Session");

  if (token) {
    try {
      const payload = await verify(token, process.env.JWT_SECRET as string);

      return c.json(payload);
    } catch (e: any) {
      console.log(e?.name);
      return c.json({ ok: "false", message: "unauthorized" }, 401);
    }
  } else {
    console.log("here");
    return c.json({ ok: "false", message: "unauthorized" }, 401);
  }
});

export default authRoutes;
