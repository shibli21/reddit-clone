import { withUrqlClient } from "next-urql";
import { NavBar } from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import Layout from "../components/Layout";
import { Link } from "@chakra-ui/core";
import NextLink from "next/link";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <Layout>
      <Link>
        <NextLink href="/create-post">create post</NextLink>
      </Link>
      <br />
      {!data ? (
        <h1>Loading ..</h1>
      ) : (
        data.posts.map((post) => <h1 key={post.id}> {post.title}</h1>)
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
