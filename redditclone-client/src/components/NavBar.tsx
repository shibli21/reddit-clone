import React from "react";
import { Box, Link, Flex, Button } from "@chakra-ui/core";

import Nextlink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";

interface Props {}

export const NavBar = (props: Props) => {
  const [{ data, fetching }] = useMeQuery();
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
        <Flex>
          <Box mr={2} color="white">
            {data.me.username}
          </Box>
          <Button
            onClick={() => {
              logout();
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
    <Flex bg="black" p={4}>
      <Box ml={"auto"} maxW="1100px">
        {body}
      </Box>
    </Flex>
  );
};
