export const MCP_PROTOCOL_VERSION = "2025-11-05";

export const MCP_TOOL = {
  studentsList: "students.list",
  studentsGet: "students.get",
  studentsProgressUpsert: "students.progress.upsert",
  teamsList: "teams.list",
  teamsGet: "teams.get",
  teamsMembersReplace: "teams.members.replace"
} as const;

export type McpToolName = (typeof MCP_TOOL)[keyof typeof MCP_TOOL];
