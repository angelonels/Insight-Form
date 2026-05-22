export type AuthContext = {
  clerkUserId: string;
  userId?: string;
  email?: string;
  displayName?: string;
  imageUrl?: string;
  claims?: Record<string, unknown>;
};
