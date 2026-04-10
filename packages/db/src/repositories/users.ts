import type { createDb } from "../client";
import { eq } from "drizzle-orm";
import { users } from "../schema";

type Database = ReturnType<typeof createDb>;

export interface ExternalIdentity {
  provider: string;
  subject: string;
  email?: string | null;
}

export function createUsersRepository(db: Database) {
  return {
    findById: (userId: string) => db.query.users.findFirst({ where: eq(users.id, userId) }),
    findByExternalIdentity: (identity: ExternalIdentity) =>
      db.query.users.findFirst({
        where: (table, { and, eq }) => and(eq(table.externalProvider, identity.provider), eq(table.externalSubject, identity.subject))
      }),
    create: async (identity: ExternalIdentity) => {
      const userId = identity.subject;

      await db.insert(users).values({
        id: userId,
        externalProvider: identity.provider,
        externalSubject: identity.subject,
        email: identity.email ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return db.query.users.findFirst({ where: eq(users.id, userId) });
    }
  };
}
