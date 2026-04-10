import { expect, test } from "bun:test";
import { sortStudentsByName } from "./index";

test("sortStudentsByName sorts by localized display name", () => {
  expect(sortStudentsByName([{ name: "Shiroko" }, { name: "Aru" }]).map((student) => student.name)).toEqual([
    "Aru",
    "Shiroko"
  ]);
});
