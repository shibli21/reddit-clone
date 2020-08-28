// import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app = express();

  app.get("/", (_, res) => {
    res.send("HEllo world!");
  });

  app.listen(4000, () => {
    console.log("Server Started on localhost:4000");
  });
};

main().catch((err) => {
  console.log(err);
});
