import { Box, Flex, Heading, Link, Stack, Text } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import Layout from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data }] = usePostsQuery({
    variables: {
      limit: 50,
    },
  });
  return (
    <Layout>
      <Flex alignItems="center">
        <Heading color="teal">S redit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">create post</Link>
        </NextLink>
      </Flex>

      <br />
      {!data ? (
        <h1>Loading ..</h1>
      ) : (
        <Stack spacing={8}>
          {data.posts.map((post) => (
            <Box key={post.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={4}>{post.text}</Text>
            </Box>
          ))}
        </Stack>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
