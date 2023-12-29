import { Hono } from "hono";
import { logger } from "hono/logger";
import userApp from "./routes/user-routes";
import authRoutes from "./routes/auth-routes";
import { cors } from "hono/cors";

const app = new Hono().basePath("/api");

app.use("*", logger());

app.use("*", async (ctx, next) => {
  const wrapped = cors({
    origin: JSON.parse(process.env.CORS_ORIGIN as string),
    credentials: true,
  });
  return await wrapped(ctx, next);
});

app.route("", authRoutes);
app.route("", userApp);

app.onError(async (err, c) => {
  console.log(err);
  return c.json("internal server error", 500);
});

export default app;
