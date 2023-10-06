import { Hono } from "hono";
import { logger } from "hono/logger";
import userApp from "./routes/user-routes";
import authRoutes from "./routes/auth-routes";

const app = new Hono().basePath("/api");

app.use("*", logger());

app.route("", authRoutes);
app.route("", userApp);

app.onError(async (err, c) => {
  console.log(err);
  return c.json("internal server error", 500);
});

export default app;
