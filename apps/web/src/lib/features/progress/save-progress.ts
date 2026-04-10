import { clampProgressInput, progressInputSchema } from "@schale-ledger/core";

type ProgressRawInput = Record<string, FormDataEntryValue | string | undefined>;

const numericKeys = [
  "level",
  "rarity",
  "bondLevel",
  "exSkillLevel",
  "normalSkillLevel",
  "passiveSkillLevel",
  "subSkillLevel",
  "equipment1Tier",
  "equipment2Tier",
  "equipment3Tier",
  "uniqueWeaponRank",
  "uniqueWeaponLevel",
  "shardsOwned",
  "shardsUsed",
  "favoriteGifts"
] as const;

const allowedProgressKeys = new Set([...numericKeys, "memo"]);

function toOptionalNumber(value: FormDataEntryValue | string | undefined) {
  if (value == null) {
    return undefined;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : normalized;
}

export function toProgressMutation(input: ProgressRawInput) {
  const mutation: Record<string, unknown> = {
    memo: String(input.memo ?? "")
  };

  for (const key of numericKeys) {
    const parsed = toOptionalNumber(input[key]);
    if (parsed !== undefined) {
      mutation[key] = parsed;
    }
  }

  return mutation;
}

export function parseProgressMutation(input: ProgressRawInput) {
  const mutation = toProgressMutation(input);
  const parsed = progressInputSchema.safeParse(mutation);

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      values: mutation
    };
  }

  return {
    success: true as const,
    values: clampProgressInput(parsed.data)
  };
}

export function parseSerializedProgressFormState(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    const hasOnlyAllowedKeys = Object.keys(parsed).every((key) => allowedProgressKeys.has(key as (typeof numericKeys)[number] | "memo"));
    if (!hasOnlyAllowedKeys) {
      return null;
    }

    const isValid = Object.values(parsed).every((entry) => {
      if (entry == null) {
        return true;
      }

      if (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
        return true;
      }

      return Array.isArray(entry) && entry.every((item) => typeof item === "string");
    });

    return isValid ? parsed : null;
  } catch {
    return null;
  }
}
