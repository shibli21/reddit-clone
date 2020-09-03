import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";
import router from "next/router";

export const useIsAuth = () => {
  const [{ data, fetching }] = useMeQuery();

  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace("/login?next=" + router.pathname);
    }
  }, [data, fetching, router]);
};
