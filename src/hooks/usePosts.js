import { useEffect } from "react";
import usePostStore from "../store/postStore";

const usePosts = (params = {}) => {
  const { posts, fetchPosts, loading, hasMore } = usePostStore();

  useEffect(() => {
    fetchPosts(params, false);
  }, [JSON.stringify(params)]);

  return {
    posts,
    loading,
    hasMore,
    loadMore: () => fetchPosts(params, true),
  };
};

export default usePosts;