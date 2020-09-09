import { useGetIntId } from "./useGetIntId";
import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";

export const useGePostFromUrl = () => {
  const intId = useGetIntId();
  return usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
};
