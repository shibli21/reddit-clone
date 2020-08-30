import { EntityManager } from "@mikro-orm/postgresql";
import { User } from "./../entities/User";
import { MyContext } from "src/types";
import {
  Resolver,
  Mutation,
  Field,
  InputType,
  Arg,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql";
import "reflect-metadata";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}
@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    //! You are not logged in
    if (!req.session!.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session!.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("option") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "username can't be less than 2 word",
          },
        ],
      };
    }
    if (options.password.length <= 6) {
      return {
        errors: [
          {
            field: "password",
            message: "password can't be less than 6 word",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);

    // const user = em.create(User, {
    //   username: options.username,
    //   password: hashedPassword,
    // });
    let user;
    try {
      // await em.persistAndFlush(user);
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");
      user = result[0];
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "already exists ",
            },
          ],
        };
      }
    }

    //store user id
    //this will set a cookie on  the user
    //keep them logged in

    req.session!.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("option") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "That user doesn't exits",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Password incorrect",
          },
        ],
      };
    }

    req.session!.userId = user.id;

    return { user };
  }
}
