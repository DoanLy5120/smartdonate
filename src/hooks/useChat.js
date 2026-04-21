import { useEffect } from "react";
import useChatStore from "../store/chatStore";

const useChat = (chatId) => {
  const {
    messages,
    fetchMessages,
    loadingMessages,
    sendMessage,
    markAsRead,
  } = useChatStore();

  useEffect(() => {
    if (!chatId) return;

    fetchMessages(chatId);
    markAsRead(chatId);
  }, [chatId]);

  return {
    messages: messages[chatId] || [],
    loadingMessages,
    sendMessage: (payload) => sendMessage(chatId, payload),
  };
};

export default useChat;