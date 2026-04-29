import { create } from "zustand";
import { getUserPublicProfile } from "../api/profileService";

const useUserProfileStore = create((set, get) => ({
  profiles: {}, // cache theo id
  posts: {}, // cache posts theo id
  loading: {},
  loadingPosts: {},

  fetchUserProfile: async (id) => {
    const sid = String(id);
    if (get().profiles[sid]) return;
    if (get().loading[sid]) return;

    set((s) => ({ loading: { ...s.loading, [sid]: true } }));
    try {
      const data = await getUserPublicProfile(sid);

      set((s) => ({
        profiles: { ...s.profiles, [sid]: data },
        posts: {
          ...s.posts,
          [sid]: Array.isArray(data?.bai_dang) ? data.bai_dang : [],
        },

        loading: { ...s.loading, [sid]: false },
        loadingPosts: { ...s.loadingPosts, [sid]: false },
      }));
    } catch (err) {
      console.error("Lỗi fetch user profile:", err);
      set((s) => ({ loading: { ...s.loading, [sid]: false } }));
    }
  },
}));

export default useUserProfileStore;
