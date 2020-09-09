import { Box, Button, Flex, Link, Heading } from "@chakra-ui/core";
import Nextlink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import NextLink from "next/link";
import { useRouter } from "next/router";

interface Props {}

export const NavBar = (props: Props) => {
  const router = useRouter();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  let body = null;
  //data is loading
  if (fetching) {
  }
  //user not logged in
  else if (!data?.me) {
    body = (
      <>
        <Nextlink href="/login">
          <Link color="white" mr={2}>
            Login
          </Link>
        </Nextlink>
        <Nextlink href="/register">
          <Link color="white">Register</Link>
        </Nextlink>
      </>
    );
  } else {
    //user logged in
    body = (
      <>
        <Flex align="center">
          <NextLink href="/create-post">
            <Button as={Link} mr={2}>
              create post
            </Button>
          </NextLink>
          <Box mr={2} color="white">
            {data.me.username}
          </Box>
          <Button
            onClick={async () => {
              await logout();
              router.reload();
            }}
            isLoading={logoutFetching}
            variant="link"
          >
            Logout
          </Button>
        </Flex>
      </>
    );
  }
  return (
    <Flex position="sticky" top={0} zIndex={1} bg="black" p={4} align="center">
      <Flex maxW={800} m="auto" align="center" flex={1}>
        <Nextlink href="/">
          <Link color="white">
            <Heading>Sredit</Heading>
          </Link>
        </Nextlink>
        <Box ml={"auto"} maxW="1100px">
          {body}
        </Box>
      </Flex>
    </Flex>
  );
};
