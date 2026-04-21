import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useAuthStore from "./store/authStore";
import useChatStore from "./store/chatStore";
import AppRoutes from "./routes/index.jsx";

function App() {
  const location = useLocation();
  const userId = useAuthStore((s) => s.user?.id);

  // Khởi động realtime sau khi có userId
  useEffect(() => {
    if (!userId) return;

    const init = async () => {
      await useChatStore.getState().fetchChats();
      useChatStore.getState().startRealtime();
    };

    void init();

    return () => {
      useChatStore.getState().stopRealtime();
    };
  }, [userId]);

  // fetchMe lúc khởi động app
  useEffect(() => {
    useAuthStore.getState().fetchMe();
  }, []);

  // Xử lý token từ URL (OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (!token) return;
    const run = async () => {
      try {
        const { applyTokenFromUrl, fetchMe } = useAuthStore.getState();
        applyTokenFromUrl(token);
        await fetchMe();
        window.history.replaceState({}, "", location.pathname);
      } catch (err) {
        console.log("Lỗi:", err);
      }
    };
    void run();
  }, [location]);

  return <AppRoutes />;
}

export default App;
