import { create } from "zustand";
import {
  getPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  getPostMatches,
  toggleLikePost,
  getPostComments,
  createPostComment,
  deletePostComment,
  reportPost,
} from "../api/postService";

let currentPage = 1;
let currentKey = "";
const detailPromises = {};

const usePostStore = create((set, get) => ({
  posts: [],
  postDetail: {},
  matches: {},
  loadingMatches: null,
  loading: false,
  hasMore: true,
  comments: {}, 
  loadingComments: null,

  fetchPosts: async (params = {}, loadMore = false) => {
    const key = JSON.stringify(params);

    if (!loadMore && currentKey !== key) {
      currentPage = 1;
      set({ posts: [], hasMore: true });
    }

    const page = loadMore ? currentPage + 1 : 1;

    if (get().loading) return;

    set({ loading: true });
    currentKey = key;

    try {
      const res = await getPosts({ ...params, page });

      const newPosts = (res?.data?.data || []).map((p) => ({
        ...p,
        liked: p.da_thich ?? false,
      }));

      currentPage = page;

      set({
        posts: loadMore ? [...get().posts, ...newPosts] : newPosts,
        loading: false,
        hasMore: !!res?.data?.next_page_url,
      });

      return newPosts;
    } catch (err) {
      console.error("Lỗi fetch posts:", err);
      set({ loading: false });
      return [];
    }
  },

  fetchPostDetail: async (id) => {
    const sid = String(id);
    const cached = get().postDetail[sid];
    if (cached) return cached;

    if (detailPromises[sid]) return detailPromises[sid];

    detailPromises[sid] = (async () => {
      try {
        const res = await getPostDetail(id);

        const data = res?.data || null;
        const mapped = data ? { ...data, liked: data.da_thich ?? false } : null;

        set({
          postDetail: {
            ...get().postDetail,
            [sid]: mapped,
          },
        });

        return data;
      } catch (err) {
        console.error("Lỗi fetch post detail:", err);
        return null;
      } finally {
        delete detailPromises[sid];
      }
    })();

    return detailPromises[sid];
  },

  createPost: async (formData) => {
    try {
      const res = await createPost(formData);

      const newPost = res?.data;

      set({
        posts: [newPost, ...get().posts],
      });

      return res;
    } catch (err) {
      console.error("Lỗi create post:", err);
      throw err;
    }
  },

  updatePost: async (id, formData) => {
    try {
      const res = await updatePost(id, formData);
      const updated = res?.data;

      const sid = String(id);

      set({
        posts: get().posts.map((p) =>
          p.id === id ? { ...updated, liked: updated.da_thich ?? false } : p,
        ),
        postDetail: {
          ...get().postDetail,
          [sid]: { ...updated, liked: updated.da_thich ?? false },
        },
      });

      return res;
    } catch (err) {
      console.error("Lỗi update post:", err);
      return null;
    }
  },

  deletePost: async (id) => {
    try {
      await deletePost(id);

      set({
        posts: get().posts.filter((p) => p.id !== id),
      });

      return true;
    } catch (err) {
      console.error("Lỗi delete post:", err);
      return false;
    }
  },

  fetchMatches: async (id, force = false) => {
    const key = String(id);

    if (!force && get().matches[key]) {
      return get().matches[key];
    }

    if (get().loadingMatches === key) return;

    set({ loadingMatches: key });

    try {
      const res = await getPostMatches(id);

      const data = res?.data || [];

      set({
        matches: {
          ...get().matches,
          [key]: data,
        },
        loadingMatches: null,
      });

      return data;
    } catch (err) {
      console.error("Lỗi fetch matches:", err);

      set({ loadingMatches: null });
      return [];
    }
  },

  toggleLike: async (postId) => {
    try {
      const res = await toggleLikePost(postId);
      const { liked, so_luot_thich } = res?.data || {};

      const sid = String(postId);
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, liked, so_luot_thich } : p,
        ),
        postDetail: state.postDetail[sid]
          ? {
              ...state.postDetail,
              [sid]: { ...state.postDetail[sid], liked, so_luot_thich },
            }
          : state.postDetail,
      }));

      return res;
    } catch (err) {
      console.error("Lỗi like:", err);
      return null;
    }
  },
  fetchComments: async (postId) => {
    const key = String(postId);

    set({ loadingComments: key });

    try {
      const res = await getPostComments(postId);

      const raw = res?.data?.data || [];

      set({
        comments: {
          ...get().comments,
          [key]: { list: raw },
        },
        loadingComments: null,
      });
    } catch (err) {
      console.error(err);
      set({ loadingComments: null });
      return [];
    }
  },
  createComment: async (postId, payload) => {
    try {
      const res = await createPostComment(postId, payload);
      const newCmt = res?.data;

      const key = String(postId);

      set((state) => {
        const old = state.comments[key]?.list || [];
        const parentId = payload?.id_cha ?? null;

        if (!parentId) {
          return {
            comments: {
              ...state.comments,
              [key]: { list: [...old, { ...newCmt, replies: [] }] },
            },
          };
        }

        const updated = old.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newCmt],
            };
          }
          return c;
        });

        return {
          comments: {
            ...state.comments,
            [key]: { list: updated },
          },
        };
      });

      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId
            ? { ...p, so_binh_luan: (p.so_binh_luan ?? 0) + 1 }
            : p,
        ),
      }));

      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  deleteComment: async (commentId, postId) => {
    try {
      await deletePostComment(commentId);

      const key = String(postId);

      set((state) => {
        const old = state.comments[key]?.list || [];

        const target = old.find((c) => c.id === commentId);
        const deleteCount = target ? 1 + (target.replies?.length ?? 0) : 1;

        const updated = old
          .map((c) => {
            if (c.id === commentId) return null; 
            const newReplies = (c.replies || []).filter(
              (r) => r.id !== commentId,
            );
            return { ...c, replies: newReplies };
          })
          .filter(Boolean);

        return {
          comments: {
            ...state.comments,
            [key]: { list: updated },
          },
          posts: state.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  so_binh_luan: Math.max(
                    0,
                    (p.so_binh_luan ?? 0) - deleteCount,
                  ),
                }
              : p,
          ),
        };
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  reportPost: async (postId, payload) => {
    try {
      const res = await reportPost(postId, payload);
      return res;
    } catch (err) {
      console.error("Lỗi report:", err);
      throw err;
    }
  },
}));

export default usePostStore;
