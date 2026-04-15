import { handle } from "hono/vercel";
import { app } from "../server/hono-app";

export const config = {
  runtime: "nodejs",
};

export default handle(app);
