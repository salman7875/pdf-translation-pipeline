export type AuthUser = {
  id: number;
  email: string;
  username: string | null;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
};
