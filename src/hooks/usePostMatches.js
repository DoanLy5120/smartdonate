import { useEffect } from "react";
import usePostStore from "../store/postStore";

const usePostMatches = (postId) => {
  const { matches, fetchMatches, loadingMatches } = usePostStore();

  useEffect(() => {
    if (!postId) return;
    fetchMatches(postId);
  }, [postId]);

  return {
    matches: matches[postId] || [],
    loading: loadingMatches,
  };
};

export default usePostMatches;