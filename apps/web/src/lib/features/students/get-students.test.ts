import { expect, test } from "bun:test";
import { buildStudentPagination, toStudentListModel } from "./get-students";
import { getStudentDetail } from "./get-student-detail";

test("toStudentListModel preserves query and groups filters", () => {
  const model = toStudentListModel({
    query: { q: "Hoshino", school: "Abydos", role: "Tank", position: "Front", page: 2 },
    students: [],
    total: 30
  });

  expect(model.query.q).toBe("Hoshino");
  expect(model.filters.school).toBe("Abydos");
  expect(model.pagination.page).toBe(2);
  expect(model.pagination.pageCount).toBe(2);
});

test("toStudentListModel falls back to page 1 for invalid page input", () => {
  const model = toStudentListModel({
    query: { page: Number.NaN },
    students: [],
    total: 0
  });

  expect(model.pagination.page).toBe(1);
});

test("toStudentListModel keeps pageCount from total even when current page has no rows", () => {
  const model = toStudentListModel({
    query: { page: 3 },
    students: [],
    total: 50
  });

  expect(model.pagination.page).toBe(3);
  expect(model.pagination.pageCount).toBe(3);
});

test("toStudentListModel clamps page to the last page when it is too large", () => {
  const model = toStudentListModel({
    query: { page: 999 },
    students: [],
    total: 50
  });

  expect(model.pagination.page).toBe(3);
  expect(model.pagination.previousPage).toBe(2);
  expect(model.pagination.nextPage).toBeNull();
});

test("getStudentDetail throws 404 when student does not exist", async () => {
  await expect(
    getStudentDetail(
      {
        query: {
          students: { findFirst: async () => null },
          studentProgress: { findFirst: async () => null }
        }
      } as never,
      "user_1",
      "missing"
    )
  ).rejects.toMatchObject({ status: 404 });
});

test("buildStudentPagination exposes previous and next pages", () => {
  const pagination = buildStudentPagination(2, 4);

  expect(pagination.previousPage).toBe(1);
  expect(pagination.nextPage).toBe(3);
});
