import { useEffect } from "react";
import usePostStore from "../store/postStore";

const EMPTY = [];

export default function useRelated(postId) {
  const key = String(postId);
  const related = usePostStore((s) => s.related[key] ?? EMPTY);
  const status = usePostStore((s) => s.relatedStatus[key]);
  const fetchRelated = usePostStore((s) => s.fetchRelated);

  useEffect(() => {
    if (!postId) return;
    if (status === "ok" || status === "loading" || status === "empty") return;
    fetchRelated(postId);
  }, [postId, status]);

  return {
    related,
    loading: status === "loading",
    empty: status === "empty",
  };
}