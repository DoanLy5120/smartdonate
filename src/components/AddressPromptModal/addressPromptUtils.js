const ADDRESS_PROMPT_KEY = (userId) => `addressPromptSeen_${userId}`;

export function shouldShowAddressPrompt(userId) {
  if (!userId) return false;
  return !localStorage.getItem(ADDRESS_PROMPT_KEY(userId));
}

export function markAddressPromptSeen(userId) {
  if (!userId) return;
  localStorage.setItem(ADDRESS_PROMPT_KEY(userId), "true");
}