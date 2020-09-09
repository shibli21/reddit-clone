import { Updoot } from "./entities/Updoot";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { MyContext } from "src/types";
import { buildSchema } from "type-graphql";
import { createConnection, getConnection, getConnectionManager } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import path from "path";
import { createUserLoader } from "./utils/createUserLoader";

const main = async () => {
  // const connection = await createConnection({
  //   type: "mysql",
  //   host: "localhost",
  //   port: 3306,
  //   username: "root",
  //   database: "sredit",
  //   synchronize: true,
  //   logging: true,
  //   entities: [User, Post, Updoot],
  // });
  const connection = await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5433,
    password: "root",
    username: "postgres",
    database: "sredit3",
    synchronize: true,
    logging: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Post, Updoot],
  });

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // *10 years
        httpOnly: true,
        sameSite: "lax", //csrf
        secure: __prod__, //cookie only work is https
      },
      saveUninitialized: false,
      secret: "keyboard cat", // ! have to make this environment variable
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log(
      "Server Started on http://localhost:4000  && http://localhost:4000/graphql"
    );
  });
};

main().catch((err) => {
  console.log(err);
});
