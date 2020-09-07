import React, { useState } from "react";
import { Box, IconButton } from "@chakra-ui/core";
import {
  PostSnippetFragment,
  useVoteMutation,
  VoteMutationVariables,
} from "../generated/graphql";

interface UpdootSection {
  post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSection> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "up-loading" | "down-loading" | "not-loading"
  >();
  const [, vote] = useVoteMutation();
  return (
    <Box mb={4}>
      <IconButton
        onClick={async () => {
          setLoadingState("up-loading");
          await vote({
            postId: post.id,
            value: 1,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "up-loading"}
        icon="chevron-up"
        aria-label="updoot"
      />
      <IconButton
        onClick={async () => {
          setLoadingState("down-loading");
          await vote({
            postId: post.id,
            value: -1,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "down-loading"}
        icon="chevron-down"
        aria-label="downdoot"
      />
      {post.points}
    </Box>
  );
};

export default UpdootSection;
