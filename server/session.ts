import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getSessionVersion } from "./db.ts";

const SESSION_COOKIE = "vertix_session";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// resolved eagerly at import time so a missing/weak secret is handled on boot
// instead of surfacing later as silently-rejected sessions
const secretEnv = process.env.SESSION_SECRET;
const isProd = process.env.NODE_ENV === "production";

// No SESSION_SECRET configured: generate one and persist it next to the
// database, so sessions survive restarts without any manual secret management.
// (Once written it is stable until the file is deleted.)
function persistedSecret(): string | null {
	const dir = process.env.DATA_DIR || path.join(import.meta.dirname);
	const file = path.join(dir, ".session-secret");
	try {
		if (fs.existsSync(file)) {
			const existing = fs.readFileSync(file, "utf8").trim();
			if (existing.length >= 32) return existing;
		}
		const generated = randomBytes(48).toString("base64");
		fs.writeFileSync(file, generated, { mode: 0o600 });
		return generated;
	} catch {
		return null;
	}
}

const effectiveSecret =
	secretEnv && secretEnv.length >= 32
		? secretEnv
		: isProd
			? (persistedSecret() ??
				(() => {
					throw new Error(
						"SESSION_SECRET unset and could not persist one to DATA_DIR — set it in .env",
					);
				})())
			: // development only: fixed fallback so `pnpm dev` boots with zero
				// configuration; sessions signed with it only work against a dev server
				"vertix-dev-only-session-secret-not-for-production";
const SECRET = new TextEncoder().encode(effectiveSecret);

function getSecret(): Uint8Array {
	return SECRET;
}

export function isProduction(): boolean {
	return process.env.NODE_ENV === "production";
}

export interface SessionPayload {
	userId: number;
	username: string;
}

export async function createSessionToken(
	userId: number,
	username: string,
): Promise<string> {
	// Bind the token to the user's current session version so bumping it on
	// logout (or a future password/security reset) invalidates every issued JWT.
	const sv = getSessionVersion(userId);
	return new SignJWT({ userId, username, sv })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(`${MAX_AGE}s`)
		.sign(getSecret());
}

export async function validateSessionToken(
	token: string,
): Promise<SessionPayload | null> {
	try {
		const { payload } = await jwtVerify(token, getSecret());
		const userId = payload.userId as number;
		// Reject tokens whose session version no longer matches: the account has
		// been logged out (or reset) since this token was issued.
		if (getSessionVersion(userId) !== (payload.sv as number)) return null;
		return {
			userId,
			username: payload.username as string,
		};
	} catch {
		return null;
	}
}

export async function createSessionCookie(
	userId: number,
	username: string,
): Promise<string> {
	const token = await createSessionToken(userId, username);
	const encoded = encodeURIComponent(token);
	const secure = isProduction() ? "; Secure" : "";
	return `${SESSION_COOKIE}=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`;
}

export async function validateSession(
	cookieHeader: string | undefined,
): Promise<SessionPayload | null> {
	if (!cookieHeader) return null;

	const cookies = cookieHeader.split(";").map((c) => c.trim());
	const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE}=`));
	if (!sessionCookie) return null;

	const token = decodeURIComponent(sessionCookie.split("=").slice(1).join("="));
	return validateSessionToken(token);
}
