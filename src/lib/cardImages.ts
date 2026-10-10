// Image rules shared by the upload route, card validation and the image picker

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB, checked after in-browser compression

// Images are served from /api/images/<32 hex chars>; the random key is what grants access
export const IMAGE_URL_PATTERN = /^\/api\/images\/([a-f0-9]{32})$/;

export const imageKeyFromUrl = (url: string | null | undefined) => (url ? IMAGE_URL_PATTERN.exec(url)?.[1] : undefined);
