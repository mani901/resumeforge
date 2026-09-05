import { createHmac, timingSafeEqual } from "crypto";

const TTL_MS = 60_000;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function mintPrintToken(documentId: string): string {
  const expires = Date.now() + TTL_MS;
  return `${expires}.${sign(`${documentId}:${expires}`)}`;
}

export function verifyPrintToken(documentId: string, token: string): boolean {
  const [expiresStr, signature] = token.split(".");
  const expires = Number(expiresStr);
  if (!expires || !signature || Date.now() > expires) return false;
  const expected = sign(`${documentId}:${expires}`);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
