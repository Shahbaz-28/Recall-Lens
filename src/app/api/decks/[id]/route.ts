import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../mongoose/mongoose";
import Card from "../../mongoose/model/cardModel";
import ReviewLog from "../../mongoose/model/reviewLogModel";
import { requireUser } from "@/lib/serverAuth";
import { findUserDeck, getDeckCounts } from "@/lib/decks";
import { deleteImages } from "@/lib/imageStore";

type Params = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ message: "Deck not found" }, { status: 404 });

// Deck name + counts
export const GET = async (req: NextRequest, { params }: Params) => {
	try {
		const userId = await requireUser(req);
		if (userId instanceof NextResponse) return userId;
		const { id } = await params;
		await connectToDatabase();

		const deck = await findUserDeck(userId, id);
		if (!deck) return notFound();
		const counts = await getDeckCounts(userId, [deck._id]);
		return NextResponse.json({ deck: { _id: id, name: deck.name, counts: counts.get(id) } });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Failed to load deck" }, { status: 500 });
	}
};

// Rename: { name }
export const PATCH = async (req: NextRequest, { params }: Params) => {
	try {
		const userId = await requireUser(req);
		if (userId instanceof NextResponse) return userId;
		const { id } = await params;
		const { name } = await req.json();
		if (typeof name !== "string" || !name.trim())
			return NextResponse.json({ message: "Deck name is required" }, { status: 400 });

		await connectToDatabase();
		const deck = await findUserDeck(userId, id);
		if (!deck) return notFound();
		deck.name = name.trim().slice(0, 100);
		await deck.save();
		return NextResponse.json({ deck: { _id: id, name: deck.name } });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Failed to rename deck" }, { status: 500 });
	}
};

// Delete the deck together with its cards and review history
export const DELETE = async (req: NextRequest, { params }: Params) => {
	try {
		const userId = await requireUser(req);
		if (userId instanceof NextResponse) return userId;
		const { id } = await params;
		await connectToDatabase();

		const deck = await findUserDeck(userId, id);
		if (!deck) return notFound();
		const cardImages = await Card.find({ userId, deckId: deck._id }, { frontImage: 1, backImage: 1 }).lean();
		await Promise.all([
			Card.deleteMany({ userId, deckId: deck._id }),
			ReviewLog.deleteMany({ userId, deckId: deck._id }),
			deleteImages(
				userId,
				cardImages.flatMap((card) => [card.frontImage, card.backImage])
			),
		]);
		await deck.deleteOne();
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Failed to delete deck" }, { status: 500 });
	}
};
