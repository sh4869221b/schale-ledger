declare global {
  namespace App {
    interface Locals {
      user?: {
        userId: string;
        email?: string | null;
      };
      session?: {
        sessionId: string;
        expiresAt: string;
      };
    }
  }
}

export {};
