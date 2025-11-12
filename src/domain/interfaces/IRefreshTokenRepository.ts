import type { RefreshToken } from "../entities/RefreshToken";

export interface IRefreshTokenRepository {
  create(refreshToken: RefreshToken): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  findByUserId(userId: string): Promise<RefreshToken[]>;
  deleteByToken(token: string): Promise<void>;
  deleteAllByUserId(userId: string): Promise<void>;
}
