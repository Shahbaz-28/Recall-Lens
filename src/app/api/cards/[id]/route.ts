import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "../../mongoose/mongoose";
import Card from "../../mongoose/model/cardModel";
import ReviewLog from "../../mongoose/model/reviewLogModel";
import { requireUser } from "@/lib/serverAuth";
import { parseCardInput } from "@/lib/cardTags";
import { deleteImages } from "@/lib/imageStore";

type Params = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ message: "Card not found" }, { status: 404 });

// Edit a card: { front, back, frontImage, backImage, tag, subtopics }
export const PATCH = async (req: NextRequest, { params }: Params) => {
	try {
		const userId = await requireUser(req);
		if (userId instanceof NextResponse) return userId;
		const { id } = await params;
		if (!mongoose.isValidObjectId(id)) return notFound();
		const input = parseCardInput(await req.json());
		if ("error" in input) return NextResponse.json({ message: input.error }, { status: 400 });

		await connectToDatabase();
		const previous = await Card.findOneAndUpdate({ _id: id, userId }, input.card); // returns the old version
		if (!previous) return notFound();
		// remove images that were replaced or taken off the card
		const kept = [input.card.frontImage, input.card.backImage];
		await deleteImages(
			userId,
			[previous.frontImage, previous.backImage].filter((url) => !kept.includes(url ?? null))
		);
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Failed to update card" }, { status: 500 });
	}
};

export const DELETE = async (req: NextRequest, { params }: Params) => {
	try {
		const userId = await requireUser(req);
		if (userId instanceof NextResponse) return userId;
		const { id } = await params;
		if (!mongoose.isValidObjectId(id)) return notFound();

		await connectToDatabase();
		const card = await Card.findOneAndDelete({ _id: id, userId });
		if (!card) return notFound();
		await Promise.all([
			ReviewLog.deleteMany({ userId, cardId: card._id }),
			deleteImages(userId, [card.frontImage, card.backImage]),
		]);
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Failed to delete card" }, { status: 500 });
	}
};
