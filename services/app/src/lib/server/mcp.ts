import { ValidationError } from "@schale-ledger/application";
import { MCP_PROTOCOL_VERSION, MCP_TOOL } from "@schale-ledger/contracts";
import type { LedgerService } from "@schale-ledger/application";
import { z } from "zod";

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

const studentsGetSchema = z.object({
  studentId: z.string().min(1)
});

const studentsListSchema = z
  .object({
    q: z.string().optional(),
    school: z.string().optional(),
    role: z.string().optional(),
    position: z.string().optional(),
    attackType: z.string().optional(),
    defenseType: z.string().optional(),
    isLimited: z.boolean().optional()
  })
  .optional();

const studentsProgressUpsertSchema = z.object({
  studentId: z.string().min(1),
  patch: z
    .object({
      level: z.number().int().optional(),
      rarity: z.number().int().optional(),
      bondLevel: z.number().int().optional(),
      exSkillLevel: z.number().int().optional(),
      normalSkillLevel: z.number().int().optional(),
      passiveSkillLevel: z.number().int().optional(),
      subSkillLevel: z.number().int().optional(),
      equipment1Tier: z.number().int().optional(),
      equipment2Tier: z.number().int().optional(),
      equipment3Tier: z.number().int().optional(),
      uniqueWeaponRank: z.number().int().optional(),
      uniqueWeaponLevel: z.number().int().optional(),
      shardsOwned: z.number().int().optional(),
      shardsUsed: z.number().int().optional(),
      favoriteGifts: z.number().int().optional(),
      memo: z.string().optional()
    })
    .strict()
});

const teamsListSchema = z
  .object({
    mode: z.union([z.literal("raid"), z.literal("jfd")]).optional()
  })
  .optional();

const teamsGetSchema = z.object({
  teamId: z.string().min(1)
});

const teamsMembersReplaceSchema = z.object({
  teamId: z.string().min(1),
  members: z.array(
    z.object({
      studentId: z.string().min(1),
      positionIndex: z.number().int(),
      isSupport: z.boolean().optional()
    })
  )
});

export function mcpInitializeResult() {
  return {
    protocolVersion: MCP_PROTOCOL_VERSION,
    capabilities: {
      tools: {}
    },
    serverInfo: {
      name: "schale-ledger-mcp",
      title: "シャーレ育成手帳 MCP",
      version: "0.1.0"
    }
  };
}

export function mcpToolsListResult() {
  return {
    tools: [
      {
        name: MCP_TOOL.studentsList,
        title: "生徒一覧取得",
        description: "生徒マスタ一覧とユーザ進捗サマリを返します",
        inputSchema: {
          type: "object",
          properties: {
            q: { type: "string" },
            school: { type: "string" },
            role: { type: "string" },
            position: { type: "string" },
            attackType: { type: "string" },
            defenseType: { type: "string" },
            isLimited: { type: "boolean" }
          }
        }
      },
      {
        name: MCP_TOOL.studentsGet,
        title: "生徒詳細取得",
        description: "生徒詳細とユーザ進捗を返します",
        inputSchema: {
          type: "object",
          required: ["studentId"],
          properties: {
            studentId: { type: "string" }
          }
        }
      },
      {
        name: MCP_TOOL.studentsProgressUpsert,
        title: "生徒進捗更新",
        description: "指定生徒の進捗を部分更新します",
        inputSchema: {
          type: "object",
          required: ["studentId", "patch"],
          properties: {
            studentId: { type: "string" },
            patch: { type: "object" }
          }
        }
      },
      {
        name: MCP_TOOL.teamsList,
        title: "編成一覧取得",
        description: "ユーザの編成一覧を返します",
        inputSchema: {
          type: "object",
          properties: {
            mode: { type: "string", enum: ["raid", "jfd"] }
          }
        }
      },
      {
        name: MCP_TOOL.teamsGet,
        title: "編成詳細取得",
        description: "指定編成の詳細を返します",
        inputSchema: {
          type: "object",
          required: ["teamId"],
          properties: {
            teamId: { type: "string" }
          }
        }
      },
      {
        name: MCP_TOOL.teamsMembersReplace,
        title: "編成メンバー置換",
        description: "指定編成のメンバーを完全置換します",
        inputSchema: {
          type: "object",
          required: ["teamId", "members"],
          properties: {
            teamId: { type: "string" },
            members: { type: "array" }
          }
        }
      }
    ]
  };
}

function toToolResult(payload: unknown) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2)
      }
    ],
    structuredContent: payload
  };
}

export async function executeMcpToolCall(
  service: LedgerService,
  userId: string,
  name: string,
  args: unknown
): Promise<unknown> {
  switch (name) {
    case MCP_TOOL.studentsList: {
      const parsed = studentsListSchema.safeParse(args);
      if (!parsed.success) {
        throw new ValidationError("students.list の引数が不正です", { issues: parsed.error.flatten() });
      }
      const students = await service.listStudents(userId, parsed.data);
      return toToolResult({ students });
    }
    case MCP_TOOL.studentsGet: {
      const parsed = studentsGetSchema.safeParse(args);
      if (!parsed.success) {
        throw new ValidationError("students.get の引数が不正です", { issues: parsed.error.flatten() });
      }
      const student = await service.getStudentDetail(userId, parsed.data.studentId);
      return toToolResult(student);
    }
    case MCP_TOOL.studentsProgressUpsert: {
      const parsed = studentsProgressUpsertSchema.safeParse(args);
      if (!parsed.success) {
        throw new ValidationError("students.progress.upsert の引数が不正です", {
          issues: parsed.error.flatten()
        });
      }
      const student = await service.upsertStudentProgress(userId, parsed.data.studentId, parsed.data.patch);
      return toToolResult(student);
    }
    case MCP_TOOL.teamsList: {
      const parsed = teamsListSchema.safeParse(args);
      if (!parsed.success) {
        throw new ValidationError("teams.list の引数が不正です", { issues: parsed.error.flatten() });
      }
      const teams = await service.listTeams(userId, parsed.data?.mode);
      return toToolResult({ teams });
    }
    case MCP_TOOL.teamsGet: {
      const parsed = teamsGetSchema.safeParse(args);
      if (!parsed.success) {
        throw new ValidationError("teams.get の引数が不正です", { issues: parsed.error.flatten() });
      }
      const team = await service.getTeam(userId, parsed.data.teamId);
      return toToolResult(team);
    }
    case MCP_TOOL.teamsMembersReplace: {
      const parsed = teamsMembersReplaceSchema.safeParse(args);
      if (!parsed.success) {
        throw new ValidationError("teams.members.replace の引数が不正です", {
          issues: parsed.error.flatten()
        });
      }
      const team = await service.replaceTeamMembers(userId, parsed.data.teamId, parsed.data.members);
      return toToolResult(team);
    }
    default:
      throw new ValidationError("未知のツール名です", { toolName: name });
  }
}
