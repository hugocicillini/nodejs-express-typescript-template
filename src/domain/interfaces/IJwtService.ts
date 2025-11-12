export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

export interface IJwtService {
  generateAccessToken(
    userId: string,
    email: string,
    name: string,
    roles: string[],
  ): string;
  generateRefreshToken(userId: string, tokenId: string): string;
  verifyAccessToken(token: string): JwtPayload;
  verifyRefreshToken(token: string): RefreshTokenPayload;
}
