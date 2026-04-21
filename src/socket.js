import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { API_URL } from "./api/config";
import api from "./api/authService";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT,
  forceTLS: false,
  enabledTransports: ["ws", "wss"],
  authEndpoint: `${API_URL}/broadcasting/auth`,
  authorizer: (channel) => ({
    authorize: async (socketId, callback) => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.post(
          "/broadcasting/auth",
          {
            socket_id: socketId,
            channel_name: channel.name,
          },
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                }
              : { Accept: "application/json" },
          },
        );
        callback(false, res.data);
      } catch (err) {
        callback(true, err);
      }
    },
  }),
  auth: {
    headers: {
      Accept: "application/json",
    },
  },
});

export default echo;