import { db } from "@/utils/db";
import { vValidator } from "@hono/valibot-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { object, string } from "valibot";
import { insertUserSchema, users } from "../drizzle/schema";
import { compareHash } from "@/utils/encryption";
import { sign } from "hono/jwt";
import userService from "../module/user";

const authSchema = object({
  username: string(),
  password: string(),
});

const userApp = new Hono().basePath("/users");

userApp.get("/", async (c) => {
  const allUsers = await userService.getAll();

  return c.json({ ok: true, data: allUsers });
});

userApp.get("/:userId", async (c) => {
  const { userId } = c.req.param();

  if (Number.isNaN(+userId)) {
    return c.json({ ok: false, message: "bad request" }, 400);
  }

  const user = await userService.getById(+userId);

  if (!user) {
    return c.json({ ok: false, message: "user not found!" }, 404);
  }

  return c.json({ ok: true, data: user });
});

userApp.post("/", vValidator("json", insertUserSchema), async (c) => {
  const data = c.req.valid("json");

  if (await userService.checkUser(data.email)) {
    return c.json({ ok: false, message: "user already exist" }, 400);
  }

  const userAdded = await userService.addUser(data);

  return c.json({ ok: true, data: userAdded[0] });
});

export default userApp;
