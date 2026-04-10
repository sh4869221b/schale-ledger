import { expect, test } from "bun:test";
import { verifyAccessJwt } from "./access";

test("verifyAccessJwt rejects tokens with the wrong audience", async () => {
  await expect(
    verifyAccessJwt(
      "header.payload.signature",
      {
        teamDomain: "example.cloudflareaccess.com",
        audience: "expected-aud"
      },
      {
        jwtVerify: async (_token, _jwks, options) => {
          expect(options.audience).toBe("expected-aud");
          throw new Error("audience mismatch");
        }
      }
    )
  ).rejects.toThrow("invalid access token");
});
