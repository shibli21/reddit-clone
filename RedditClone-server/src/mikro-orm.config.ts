import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

export default {
  entities: [Post],
  dbName: "redditClone",
  type: "postgresql",
  debug: !__prod__,
  password: "root",
} as Parameters<typeof MikroORM.init>[0];
