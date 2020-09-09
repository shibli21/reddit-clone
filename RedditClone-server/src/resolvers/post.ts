import { Updoot } from "./../entities/Updoot";
import "reflect-metadata";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { isAuth } from "../middleware/isAuth";
import { Post } from "./../entities/Post";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const userId = req.session!.userId;
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const replacements: any[] = [realLimitPlusOne];

    if (req.session!.userId) {
      replacements.push(req.session!.userId);
    }

    let cursorIndex = 3;
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      cursorIndex = replacements.length;
    }

    const posts = await getConnection().query(
      `
        SELECT p.*,
          json_build_object(
            'id' ,u.id,
            'username' ,u.username,
            'email',u.email,
            'createdAt' ,u."createdAt",
            'updatedAt' ,u."updatedAt"
          ) creator ,
          ${
            req.session!.userId
              ? ' (select value from updoot where "userId" = $2 AND "postId" = p.id) "voteStatus"'
              : 'null as "voteStatus"'
          }
            
        from post p 
        inner join public.user u on u.id = p."creatorId"
        ${cursor ? `where p."createdAt" < $${cursorIndex}` : ""}  
        order by p."createdAt" DESC
        limit $1
      `,
      replacements
    );

    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("p")

    //   .innerJoinAndSelect("p.creator", "user", "user.id = p.creatorId")
    //   .orderBy(`"p_createdAt"`, "DESC")
    //   .addSelect(
    //     `( SELECT value FROM updoot u WHERE "userId" = ${userId} AND "postId" = p.id) voteStatus`
    //   )
    //   // .from(Updoot, "u")
    //   // .where("u.postId = p.id")
    //   // .andWhere("u.userId =:id", { id: userId })

    //   // .where(
    //   //   `, (SELECT value FROM updoot WHERE userId = ${userId} AND postId = p.id) 'voteStatus'`
    //   // )
    //   .take(realLimitPlusOne);
    // if (cursor) {
    //   qb.where(`"p.createdAt" < :cursor`, {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    // const posts = await qb.getMany();

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id, { relations: ["creator"] });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session!;

    const updoot = await Updoot.findOne({ where: { postId, userId } });

    // the user has voted on the post before
    // and they are changing their vote
    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
    update updoot
    set value = $1
    where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );

        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2
        `,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      // has never voted before
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
    insert into updoot ("userId", "postId", value)
    values ($1, $2, $3)
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
    update post
    set points = points + $1
    where id = $2
      `,
          [realValue, postId]
        );
      });
    }
    return true;

    // const isUpdoot = value !== -1;
    // const realValue = isUpdoot ? 1 : -1;
    // const { userId } = req.session!;

    // const updoot = await Updoot.findOne({ where: { postId, userId } });
    // //user has voted on the post before
    // //and they are changing their vote
    // if (updoot && updoot.value !== realValue) {
    //   await getConnection().transaction(async (tm) => {
    //     const points = await tm
    //       .getRepository(Post)
    //       .createQueryBuilder()
    //       .where("id =:id", { id: postId })
    //       .getOne();

    //     await tm
    //       .createQueryBuilder()
    //       .update(Updoot)
    //       .set({
    //         value: realValue,
    //       })
    //       .where("postId =:id1", { id1: postId })
    //       .andWhere("userId =:id", { id: userId })
    //       .execute();

    //     await tm
    //       .createQueryBuilder()
    //       .update(Post)
    //       .set({
    //         points: 2 * realValue + points?.points!,
    //       })
    //       .where("id =:id", { id: postId })
    //       .execute();
    //   });
    // } else if (!updoot) {
    //   //has never voted before
    //   await getConnection().transaction(async (tm) => {
    //     await tm
    //       .createQueryBuilder()
    //       .insert()
    //       .into(Updoot)
    //       .values({
    //         userId,
    //         postId,
    //         value: realValue,
    //       })
    //       .execute();

    //     await tm
    //       .createQueryBuilder()
    //       .update(Post)
    //       .set({
    //         points: realValue,
    //       })
    //       .where("id =:id", { id: postId })
    //       .execute();
    //   });
    // }

    // return true;
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input")
    input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    return Post.create({
      ...input,
      creatorId: req.session!.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const post = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id  = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session!.userId,
      })
      .returning("*")
      .execute();

    return post.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // * NOT CASCADE WAY
    // const post = await Post.findOne(id);
    // if (!post) {
    //   return false;
    // }

    // if (post.creatorId !== req.session!.userId) {
    //   throw new Error("not athorized");
    // }
    // await Updoot.delete({ postId: id });
    // await Post.delete({ id });
    await Post.delete({ id, creatorId: req.session!.userId });

    return true;
  }
}
