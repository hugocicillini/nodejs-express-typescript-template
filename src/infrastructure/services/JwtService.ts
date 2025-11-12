import type {
  IJwtService,
  JwtPayload,
  RefreshTokenPayload,
} from "@/domain/interfaces/IJwtService";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/shared/utils/jwt";

export class JwtService implements IJwtService {
  generateAccessToken(
    userId: string,
    email: string,
    name: string,
    roles: string[],
  ): string {
    return signAccessToken({
      sub: userId,
      email,
      name,
      roles,
    });
  }

  generateRefreshToken(userId: string, tokenId: string): string {
    return signRefreshToken({
      sub: userId,
      tokenId,
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    const payload = verifyAccessToken(token);
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: payload.roles,
    };
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    const payload = verifyRefreshToken(token);
    return {
      sub: payload.sub,
      tokenId: payload.tokenId,
    };
  }
}
