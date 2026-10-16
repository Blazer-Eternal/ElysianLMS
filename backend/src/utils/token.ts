import crypto from "crypto";

// Opaque, URL-safe, high-entropy token handed to clients (refresh tokens,
// password reset tokens). Never store the value itself.
export const generateSecureToken = (bytes = 48): string =>
    crypto.randomBytes(bytes).toString("base64url");

// SHA-256 is the right tool for high-entropy tokens: there is nothing to
// brute-force, so a fast hash is safe — and it fits sessions.token_hash
// (CHAR(64)) exactly. Passwords still use bcrypt.
export const hashToken = (token: string): string =>
    crypto.createHash("sha256").update(token).digest("hex");

// Parses JWT-style duration strings ("15m", "7d", "12h") into a Date offset.
// Invalid or unit-less input falls back to the provided default in ms.
export const ttlToDate = (ttl: string, fallbackMs: number): Date => {
    const match = /^(\d+)\s*(s|m|h|d)$/.exec((ttl ?? "").trim().toLowerCase());
    const ms = match
        ? Number(match[1]) *
          { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] as "s" | "m" | "h" | "d"]
        : fallbackMs;
    return new Date(Date.now() + ms);
};
