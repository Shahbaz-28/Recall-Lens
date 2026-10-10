import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { connectToDatabase } from "../mongoose/mongoose";
import Image from "../mongoose/model/imageModel";
import { requireUser } from "@/lib/serverAuth";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/cardImages";

// Upload a card image (multipart form field "file"). Returns { url }.
export const POST = async (req: NextRequest) => {
	try {
		const userId = await requireUser(req);
		if (userId instanceof NextResponse) return userId;

		const form = await req.formData();
		const file = form.get("file");
		if (!(file instanceof Blob)) return NextResponse.json({ message: "No image uploaded" }, { status: 400 });
		if (!ALLOWED_IMAGE_TYPES.includes(file.type))
			return NextResponse.json({ message: "Only PNG, JPEG, WebP or GIF images are supported" }, { status: 400 });
		if (file.size > MAX_IMAGE_BYTES)
			return NextResponse.json({ message: "Image is too large (max 5 MB)" }, { status: 413 });

		await connectToDatabase();
		const key = randomBytes(16).toString("hex");
		await Image.create({
			key,
			userId,
			contentType: file.type,
			data: Buffer.from(await file.arrayBuffer()),
			size: file.size,
		});
		return NextResponse.json({ url: `/api/images/${key}` }, { status: 201 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Failed to upload image" }, { status: 500 });
	}
};
