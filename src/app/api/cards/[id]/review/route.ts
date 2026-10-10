import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Grade } from "ts-fsrs";
import { connectToDatabase } from "../../../mongoose/mongoose";
import Card from "../../../mongoose/model/cardModel";
import ReviewLog from "../../../mongoose/model/reviewLogModel";
import { requireUser } from "@/lib/serverAuth";
import { scheduler, toFsrsCard } from "@/lib/fsrs";

type Params = { params: Promise<{ id: string }> };

// Answer a card: { rating } where 1 = Again, 2 = Hard, 3 = Good, 4 = Easy.
// FSRS computes the new stability/difficulty and the next due date.
export const POST = async (req: NextRequest, { params }: Params) => {
	try {
		const userId = await requireUser(req);
		if (userId instanceof NextResponse) return userId;
		const { id } = await params;
		if (!mongoose.isValidObjectId(id))
			return NextResponse.json({ message: "Card not found" }, { status: 404 });
		const { rating } = await req.json();
		if (![1, 2, 3, 4].includes(rating))
			return NextResponse.json({ message: "rating must be 1, 2, 3 or 4" }, { status: 400 });

		await connectToDatabase();
		const card = await Card.findOne({ _id: id, userId });
		if (!card) return NextResponse.json({ message: "Card not found" }, { status: 404 });

		const now = new Date();
		const { card: next, log } = scheduler.next(toFsrsCard(card), now, rating as Grade);

		card.set({ ...next, last_review: next.last_review ?? null });
		await card.save();
		await ReviewLog.create({ ...log, userId, deckId: card.deckId, cardId: card._id });

		return NextResponse.json({ ok: true, due: next.due });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Failed to save review" }, { status: 500 });
	}
};
