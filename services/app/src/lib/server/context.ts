import { LedgerService } from "@schale-ledger/application";
import { InternalError } from "@schale-ledger/application";
import { createInfrastructure } from "@schale-ledger/infrastructure";
import type { RequestEvent } from "@sveltejs/kit";
import { resolveExternalIdentity } from "./auth";

function resolveConnectionString(event: RequestEvent): string {
  const fromHyperdrive = event.platform?.env?.HYPERDRIVE?.connectionString;
  if (fromHyperdrive) {
    return fromHyperdrive;
  }

  const fromEnv =
    process.env.DATABASE_URL ??
    process.env.NEON_DATABASE_URL ??
    process.env.NEON_DATABASE_URL_DEV ??
    process.env.NEON_DATABASE_URL_PROD;

  if (!fromEnv) {
    throw new InternalError("データベース接続情報が設定されていません");
  }

  return fromEnv;
}

export async function createRequestContext(event: RequestEvent): Promise<{
  service: LedgerService;
  userId: string;
}> {
  const connectionString = resolveConnectionString(event);
  const infra = createInfrastructure({ connectionString });

  const identity = resolveExternalIdentity(event.request.headers);
  let user = await infra.userRepository.findByExternalIdentity(identity);
  if (!user) {
    try {
      user = await infra.userRepository.create(identity);
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === "23505") {
        user = await infra.userRepository.findByExternalIdentity(identity);
      } else {
        throw error;
      }
    }
  }

  if (!user) {
    throw new InternalError("ユーザー情報の初期化に失敗しました");
  }

  return {
    service: new LedgerService(infra),
    userId: user.userId
  };
}
