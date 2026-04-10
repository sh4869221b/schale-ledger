import { expect, test } from "bun:test";
import { parseSerializedProgressFormState, toProgressMutation } from "./save-progress";

test("toProgressMutation coerces blank memo to empty string", () => {
  expect(toProgressMutation({ memo: "" }).memo).toBe("");
});

test("toProgressMutation parses numeric fields from form values", () => {
  expect(
    toProgressMutation({
      level: "85",
      rarity: "4",
      memo: "notes"
    })
  ).toMatchObject({
    level: 85,
    rarity: 4,
    memo: "notes"
  });
});

test("parseSerializedProgressFormState ignores malformed JSON payloads", () => {
  expect(parseSerializedProgressFormState("not-json")).toBeNull();
});

test("parseSerializedProgressFormState ignores JSON with the wrong shape", () => {
  expect(parseSerializedProgressFormState('{"foo":1}')).toBeNull();
});
