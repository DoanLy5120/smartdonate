import { useEffect } from "react";
import usePostStore from "../store/postStore";

const useComments = (postId) => {
  const {
    comments,
    fetchComments,
    loadingComments,
    createComment,
    deleteComment,
  } = usePostStore();

  useEffect(() => {
    if (postId) fetchComments(postId);
  }, [postId]);

  return {
    comments: comments[String(postId)]?.list || [],
    loading: loadingComments === String(postId),
    createComment: (data) => createComment(postId, data),
    deleteComment: (id) => deleteComment(id, postId),
  };
};

export default useComments;