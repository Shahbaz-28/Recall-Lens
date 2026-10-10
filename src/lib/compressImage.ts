// Shrinks an image in the browser before upload: longest side ≤ maxSize px, re-encoded as WebP.
// GIFs are left alone (re-encoding would drop animation). Keeps the original if it's already smaller.
export async function compressImage(file: File, maxSize = 1600, quality = 0.85): Promise<Blob> {
	if (file.type === "image/gif") return file;
	try {
		const bitmap = await createImageBitmap(file);
		const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
		const canvas = document.createElement("canvas");
		canvas.width = Math.round(bitmap.width * scale);
		canvas.height = Math.round(bitmap.height * scale);
		canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		bitmap.close();
		const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
		return blob && blob.size < file.size ? blob : file;
	} catch {
		return file;
	}
}
