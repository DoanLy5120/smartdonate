import { useEffect } from "react";
import usePostStore from "../store/postStore";

const useRelated = (postId) => {
  const { related, relatedStatus, fetchRelated, loadingRelated } =
    usePostStore();

  const key = String(postId);
  const currentStatus = relatedStatus?.[key]; // "empty" | "ok" | undefined

  useEffect(() => {
    if (!postId) return;
    if (currentStatus === "empty") return; 
    fetchRelated(postId);
  }, [postId, currentStatus]); 

  return {
    related: related[key] || [],
    status: currentStatus,
    loading: loadingRelated === key,
  };
};

export default useRelated;
