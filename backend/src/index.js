import http from "http";
import app from "./app.js";
import { connectMongo } from "./config/db.js";
import { initSocket } from "./socket/index.js";
import { env } from "./config/env.js";

const server = http.createServer(app);

initSocket(server);

await connectMongo();

server.listen(env.PORT, () => {
  console.log(`Cipherville API running on ${env.PORT}`);
});
