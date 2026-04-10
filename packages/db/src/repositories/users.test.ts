import { expect, test } from "bun:test";
import { createUsersRepository } from "./users";

test("createUsersRepository.create returns the existing row when insert races on unique identity", async () => {
  let findCalls = 0;

  const repository = createUsersRepository({
    query: {
      users: {
        findFirst: async () => {
          findCalls += 1;
          return findCalls >= 1
            ? {
                id: "user_1",
                externalProvider: "cloudflare_access",
                externalSubject: "user_1",
                email: "test@example.com"
              }
            : null;
        }
      }
    },
    insert: () => ({
      values: async () => {
        throw new Error("UNIQUE constraint failed");
      }
    })
  } as never);

  const result = await repository.create({
    provider: "cloudflare_access",
    subject: "user_1",
    email: "test@example.com"
  });

  expect(result?.id).toBe("user_1");
});
