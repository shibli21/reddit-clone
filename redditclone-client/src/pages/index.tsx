import { NavBar } from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <NavBar />
      <div>Hello there!</div>
      <br />
      {!data ? (
        <h1>Loading ..</h1>
      ) : (
        data.posts.map((post) => <h1 key={post.id}> {post.title}</h1>)
      )}
    </>
  );
};

export default withUrqlClient(createUrqlClient)(Index);
