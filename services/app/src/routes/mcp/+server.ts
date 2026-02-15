import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createRequestContext } from "$lib/server/context";
import { normalizeError } from "$lib/server/errors";
import { executeMcpToolCall, mcpInitializeResult, mcpToolsListResult, type JsonRpcRequest, type JsonRpcResponse } from "$lib/server/mcp";

function jsonRpcResult(id: JsonRpcResponse["id"], result: unknown): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    result
  };
}

function jsonRpcError(id: JsonRpcResponse["id"], code: number, message: string, data?: unknown): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      data
    }
  };
}

function isJsonRpcRequest(payload: unknown): payload is JsonRpcRequest {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const cast = payload as Record<string, unknown>;
  return cast.jsonrpc === "2.0" && typeof cast.method === "string";
}

export const POST: RequestHandler = async (event) => {
  let payload: unknown;

  try {
    payload = await event.request.json();
  } catch {
    return json(jsonRpcError(null, -32700, "Parse error"), { status: 400 });
  }

  if (!isJsonRpcRequest(payload) || Array.isArray(payload)) {
    return json(jsonRpcError(null, -32600, "Invalid Request"), { status: 400 });
  }

  const request = payload;
  const id = request.id ?? null;

  if (request.method === "notifications/initialized" && typeof request.id === "undefined") {
    return new Response(null, { status: 204 });
  }

  if (request.method === "initialize") {
    return json(jsonRpcResult(id, mcpInitializeResult()));
  }

  if (request.method === "tools/list") {
    return json(jsonRpcResult(id, mcpToolsListResult()));
  }

  if (request.method === "tools/call") {
    const params = (request.params ?? {}) as { name?: unknown; arguments?: unknown };

    if (typeof params.name !== "string") {
      return json(jsonRpcError(id, -32602, "Invalid params", { reason: "name is required" }));
    }

    try {
      const { service, userId } = await createRequestContext(event);
      const result = await executeMcpToolCall(service, userId, params.name, params.arguments ?? {});
      return json(jsonRpcResult(id, result));
    } catch (error) {
      const normalized = normalizeError(error);
      return json(
        jsonRpcResult(id, {
          isError: true,
          content: [
            {
              type: "text",
              text: normalized.body.message
            }
          ],
          structuredContent: {
            error: normalized.body
          }
        })
      );
    }
  }

  return json(jsonRpcError(id, -32601, "Method not found"), { status: 404 });
};
