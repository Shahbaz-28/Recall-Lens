import { auth } from "@/firebase/firebaseConfig";

// TEMP-AUTH-BYPASS: set to false once Firebase Authentication is configured
const AUTH_BYPASS = true;

const getToken = async () => {
	if (AUTH_BYPASS) return "dev-bypass";
	await auth.authStateReady();
	return (await auth.currentUser?.getIdToken()) ?? null;
};

// fetch wrapper for our own API routes: adds the auth token and throws on errors
export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
	const token = await getToken();
	const res = await fetch(path, {
		method: options.method ?? "GET",
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
		cache: "no-store",
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.message ?? `Request failed (${res.status})`);
	return data as T;
}

// Uploads an image file and returns its URL (/api/images/<key>)
export async function uploadImage(file: Blob): Promise<string> {
	const token = await getToken();
	const form = new FormData();
	form.append("file", file);
	const res = await fetch("/api/images", {
		method: "POST",
		headers: token ? { Authorization: `Bearer ${token}` } : {},
		body: form,
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.message ?? `Upload failed (${res.status})`);
	return data.url as string;
}
