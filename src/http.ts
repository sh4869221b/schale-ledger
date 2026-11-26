import { invalid, LedgerError } from './rules';

const limit = 64 * 1024;
export const privateHeaders = {
  'cache-control': 'private, no-store',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'same-origin',
  'x-frame-options': 'DENY',
  'content-security-policy': "default-src 'none'; style-src 'self'; script-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};

export function html(body: string, status = 200): Response {
  return new Response(body, { status, headers: { ...privateHeaders, 'content-type': 'text/html; charset=utf-8' } });
}
export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: privateHeaders });
}
export function redirect(location: string): Response {
  return new Response(null, { status: 303, headers: { ...privateHeaders, location } });
}
export function trustedOrigin(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    throw new LedgerError(403, 'ORIGIN_REJECTED', 'このページから送信してください。');
  }
}

async function readBody(request: Request): Promise<string> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let length = 0;
  let body = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return body + decoder.decode();
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        throw new LedgerError(413, 'BODY_TOO_LARGE', '送信内容が大きすぎます。');
      }
      body += decoder.decode(value, { stream: true });
    }
  } catch (error) {
    if (error instanceof LedgerError) throw error;
    throw invalid('送信内容は UTF-8 で入力してください。');
  } finally {
    reader.releaseLock();
  }
}

function requireContent(request: Request, expected: string) {
  const received = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (received !== expected) throw new LedgerError(415, 'UNSUPPORTED_MEDIA_TYPE', `${expected} で送信してください。`);
}

export async function formInput(request: Request) {
  requireContent(request, 'application/x-www-form-urlencoded');
  return Object.fromEntries(new URLSearchParams(await readBody(request)));
}

export function cleanSearch(url: URL): Record<string, string> {
  const search = Object.fromEntries(url.searchParams);
  return Object.fromEntries(Object.entries(search).filter(([, value]) => value !== ''));
}

export function pathId(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    throw invalid('URL の形式が正しくありません。');
  }
}
