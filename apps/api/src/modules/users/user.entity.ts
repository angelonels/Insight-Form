export type User = {
  id: string;
  clerkUserId: string;
  email: string;
  displayName: string | null;
  imageUrl: string | null;
  demoFormSeededAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
