import jwt, { type SignOptions } from "jsonwebtoken";

// Payload do Access Token
export type AccessTokenPayload = {
  sub: string;
  email: string;
  name: string;
  roles: string[];
};

// Payload do Refresh Token
export type RefreshTokenPayload = {
  sub: string;
  tokenId: string;
};

// Legacy type (mantido para compatibilidade)
export type TokenPayload = AccessTokenPayload;

const defaultExpiresIn = (process.env.JWT_EXPIRES_IN ||
  "15m") as SignOptions["expiresIn"];

const defaultRefreshExpiresIn = (process.env.JWT_REFRESH_EXPIRATION ||
  "7d") as SignOptions["expiresIn"];

// ========================================
// ACCESS TOKEN (15 minutos)
// ========================================

export function signAccessToken(
  payload: Omit<AccessTokenPayload, "iat" | "exp">,
  expiresIn: SignOptions["expiresIn"] = defaultExpiresIn,
): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");

  const options = {
    algorithm: "HS256",
    expiresIn,
  } as SignOptions;

  return jwt.sign(payload, secret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");

  const decoded = jwt.verify(token, secret, {
    algorithms: ["HS256"],
  }) as jwt.JwtPayload;

  return {
    sub: String(decoded.sub),
    email: String(decoded.email),
    name: String(decoded.name),
    roles: Array.isArray(decoded.roles) ? decoded.roles : [],
  };
}

// ========================================
// REFRESH TOKEN (7 dias)
// ========================================

export function signRefreshToken(
  payload: Omit<RefreshTokenPayload, "iat" | "exp">,
  expiresIn: SignOptions["expiresIn"] = defaultRefreshExpiresIn,
): string {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET not configured");

  const options = {
    algorithm: "HS256",
    expiresIn,
  } as SignOptions;

  return jwt.sign(payload, secret, options);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET not configured");

  const decoded = jwt.verify(token, secret, {
    algorithms: ["HS256"],
  }) as jwt.JwtPayload;

  return {
    sub: String(decoded.sub),
    tokenId: String(decoded.tokenId),
  };
}
