import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../mongoose/mongoose";
import Image from "../../mongoose/model/imageModel";

type Params = { params: Promise<{ key: string }> };

// Serve an image. No auth header here because <img> tags can't send one;
// the unguessable 128-bit key in the URL is what grants access.
export const GET = async (_req: NextRequest, { params }: Params) => {
	try {
		const { key } = await params;
		if (!/^[a-f0-9]{32}$/.test(key)) return new NextResponse("Not found", { status: 404 });

		await connectToDatabase();
		const image = await Image.findOne({ key });
		if (!image) return new NextResponse("Not found", { status: 404 });

		return new NextResponse(new Uint8Array(image.data), {
			headers: {
				"Content-Type": image.contentType,
				"Content-Length": String(image.size),
				"Cache-Control": "private, max-age=31536000, immutable",
				"X-Content-Type-Options": "nosniff",
			},
		});
	} catch (error) {
		console.error(error);
		return new NextResponse("Failed to load image", { status: 500 });
	}
};
