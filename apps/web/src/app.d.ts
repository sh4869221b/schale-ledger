import type { D1Database } from "@cloudflare/workers-types";

declare global {
  namespace App {
    interface Platform {
      env: {
        DB: D1Database;
        CF_ACCESS_AUD: string;
        CF_ACCESS_TEAM_DOMAIN: string;
        SESSION_COOKIE_SECRET: string;
      };
    }

    interface Locals {
      user?: {
        userId: string;
        email: string | null;
      };
      session?: {
        sessionId: string;
        expiresAt: string;
      };
    }
  }
}

export {};
