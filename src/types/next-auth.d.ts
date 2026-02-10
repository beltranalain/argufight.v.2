import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isAdmin: boolean;
      username: string;
      avatarUrl: string | null;
      eloRating: number;
      coins: number;
      isCreator: boolean;
      totpEnabled: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
    username: string;
    avatarUrl: string | null;
    eloRating: number;
    coins: number;
    isCreator: boolean;
    totpEnabled: boolean;
  }
}
