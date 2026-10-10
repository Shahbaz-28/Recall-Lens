import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebase/firebaseAdmin";

// TEMP-AUTH-BYPASS: set to false once Firebase Authentication is configured
const AUTH_BYPASS = true;

// Returns the signed-in user's uid, or a 401 response to return from the route.
export async function requireUser(req: NextRequest): Promise<string | NextResponse> {
	const token = req.headers.get("authorization")?.split("Bearer ")[1];
	if (!token) return NextResponse.json({ message: "missing token" }, { status: 401 });
	if (AUTH_BYPASS) return "dev-user";
	try {
		const decoded = await adminAuth.verifyIdToken(token);
		return decoded.uid;
	} catch {
		return NextResponse.json({ message: "invalid token" }, { status: 401 });
	}
}
