import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { JWTVerifyGetKey } from 'jose';
import { unauthenticated } from './rules';

type Keys = (issuer: string) => JWTVerifyGetKey;
const keySets = new Map<string, JWTVerifyGetKey>();
function cloudflareKeys(issuer: string) {
  let keys = keySets.get(issuer);
  if (!keys) {
    keys = createRemoteJWKSet(new URL('/cdn-cgi/access/certs', issuer));
    keySets.set(issuer, keys);
  }
  return keys;
}

export function accessAuthenticator(keys: Keys = cloudflareKeys) {
  return async (request: Request, env: Env): Promise<string> => {
    const token = request.headers.get('cf-access-jwt-assertion');
    const issuer = env.ACCESS_ISSUER;
    const audience = env.ACCESS_AUDIENCE;
    if (!token || !issuer || !audience) throw unauthenticated();
    try {
      const { payload } = await jwtVerify(token, keys(issuer), {
        issuer,
        audience,
        algorithms: ['RS256'],
        requiredClaims: ['exp', 'iat', 'sub'],
      });
      if (payload.type !== 'app' || typeof payload.email !== 'string' || !payload.email ||
          typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 128) {
        throw unauthenticated();
      }
      return payload.sub;
    } catch {
      throw unauthenticated();
    }
  };
}
