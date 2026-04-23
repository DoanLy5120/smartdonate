import { useEffect } from "react";
import usePostStore from "../store/postStore";

const useRelated = (postId) => {
  const { related, fetchRelated, loadingRelated } = usePostStore();

  useEffect(() => {
    if (!postId) return;
    fetchRelated(postId);
  }, [postId]);

  return {
    related: related[String(postId)] || [],
    loading: loadingRelated === String(postId),
  };
};

export default useRelated;