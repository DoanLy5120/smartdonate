import { create } from "zustand";
import {
  getMeAPI,
  forgotPasswordAPI,
  resetPasswordAPI,
} from "../api/authService";

let mePromise = null;

const useAuthStore = create((set, get) => {
  const userFromStorage =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));

  const tokenFromStorage =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const rolesFromStorage =
    JSON.parse(localStorage.getItem("roles")) ||
    JSON.parse(sessionStorage.getItem("roles")) ||
    [];

  return {
    user: userFromStorage || null,
    token: tokenFromStorage || null,
    roles: rolesFromStorage,
    isFetchedMe: false,

    setAuth: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("roles", JSON.stringify(data.roles || []));

      set({
        user: data.user,
        token: data.token,
        roles: data.roles || [],
        isFetchedMe: true,
      });
    },

    setUser: (user, roles = []) => {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("roles", JSON.stringify(roles));

      set({
        user,
        roles,
        isFetchedMe: true,
      });
    },

    applyTokenFromUrl: (token) => {
      localStorage.setItem("token", token);
      localStorage.removeItem("user");
      localStorage.removeItem("roles");

      set({
        token,
        user: null,
        roles: [],
        isFetchedMe: false,
      });
    },

    fetchMe: async () => {
      const { token, logout } = get();
      if (!token) return;

      if (mePromise) return mePromise;

      mePromise = (async () => {
        try {
          const res = await getMeAPI();

          get().setUser(res.data.user, res.data.roles);
        } catch (err) {
          console.log("Lỗi lấy user:", err);
          if (err.response?.status === 401) {
            logout();
          }

          throw err;
        } finally {
          mePromise = null;
        }
      })();

      return mePromise;
    },

    forgotPassword: async (email) => {
      const res = await forgotPasswordAPI({ email });
      return res.data;
    },
    resetPassword: async (data) => {
      const res = await resetPasswordAPI(data);
      return res.data;
    },

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("roles");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("roles");

      set({
        user: null,
        token: null,
        roles: [],
        isFetchedMe: false,
      });
    },
  };
});

export default useAuthStore;
