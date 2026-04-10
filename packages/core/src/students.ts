export interface StudentLike {
  name: string;
}

export function sortStudentsByName<T extends StudentLike>(students: T[]) {
  return [...students].sort((left, right) => left.name.localeCompare(right.name, "ja"));
}
