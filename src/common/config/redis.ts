import { createClient } from "redis";
import { ENVIRONMENT } from "./environment";

const client = createClient({
  password: ENVIRONMENT.REDIS.PASSWORD,
  socket: {
    host: ENVIRONMENT.REDIS.HOST,
    port: ENVIRONMENT.REDIS.PORT,
  },
});
