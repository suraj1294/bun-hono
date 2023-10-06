import { db } from "@/utils/db";
import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { object, string } from "valibot";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { compareHash } from "@/utils/encryption";
import { sign } from "hono/jwt";
import { jwtMiddleware } from "../middleware/auth-jwt";

const authSchema = object({
  username: string(),
  password: string(),
});

const authRoutes = new Hono().basePath("/auth");

authRoutes.post("/sign-in", vValidator("json", authSchema), async (c) => {
  const body = c.req.valid("json");

  //check if user exists
  const user = await db.query.users.findFirst({
    where: eq(users.email, body.username),
  });

  if (!user) {
    return c.json({ ok: "false", message: "not found!" }, 404);
  }

  // check if password is correct
  try {
    const res = await compareHash(body.password, user.password);

    if (res) {
      const token = await sign(
        { username: body.username },
        process.env.JWT_SECRET as string
      );
      return c.json({ ok: "true", data: token });
    } else {
      return c.json(
        { ok: "false", message: "username or password doesn't match" },
        403
      );
    }
  } catch (e) {
    return c.json({ ok: "false", message: "server error" }, 500);
  }
});

authRoutes.get("/me", jwtMiddleware, (c) => {
  const payload = c.get("jwtPayload");

  return c.json(payload);
});

export default authRoutes;
