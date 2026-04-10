import { createRemoteJWKSet, jwtVerify } from "jose";

export interface AccessConfig {
  teamDomain: string;
  audience: string;
}

export interface AccessIdentity {
  sub: string;
  email: string | null;
}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

interface VerifyAccessDependencies {
  jwtVerify?: typeof jwtVerify;
}

function toNonEmptyString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function getJwks(teamDomain: string) {
  const cached = jwksCache.get(teamDomain);
  if (cached) {
    return cached;
  }

  const jwks = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
  jwksCache.set(teamDomain, jwks);
  return jwks;
}

export async function verifyAccessJwt(
  token: string,
  config: AccessConfig,
  dependencies: VerifyAccessDependencies = {}
): Promise<AccessIdentity> {
  try {
    const verify = dependencies.jwtVerify ?? jwtVerify;
    const { payload } = await verify(token, getJwks(config.teamDomain), {
      audience: config.audience,
      issuer: `https://${config.teamDomain}`
    });

    const sub = toNonEmptyString(payload.sub);
    if (!sub) {
      throw new Error("missing sub");
    }

    return {
      sub,
      email: toNonEmptyString(payload.email)
    };
  } catch {
    throw new Error("invalid access token");
  }
}
