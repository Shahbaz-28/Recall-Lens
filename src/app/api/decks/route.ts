import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../mongoose/mongoose";
import Deck from "../mongoose/model/deckModel";
import { requireUser } from "@/lib/serverAuth";
import { getDeckCounts } from "@/lib/decks";

// List the user's decks with their due/new counts
export const GET = async (req: NextRequest) => {
	try {
		const userId = await requireUser(req);
		if (userId instanceof NextResponse) return userId;
		await connectToDatabase();

		const decks = await Deck.find({ userId }).sort({ createdAt: 1 }).lean();
		const counts = await getDeckCounts(
			userId,
			decks.map((deck) => deck._id)
		);
		return NextResponse.json({
			decks: decks.map((deck) => ({
				_id: String(deck._id),
				name: deck.name,
				counts: counts.get(String(deck._id)),
			})),
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Failed to load decks" }, { status: 500 });
	}
};

// Create a deck: { name }
export const POST = async (req: NextRequest) => {
	try {
		const userId = await requireUser(req);
		if (userId instanceof NextResponse) return userId;
		const { name } = await req.json();
		if (typeof name !== "string" || !name.trim())
			return NextResponse.json({ message: "Deck name is required" }, { status: 400 });

		await connectToDatabase();
		const deck = await Deck.create({ userId, name: name.trim().slice(0, 100) });
		return NextResponse.json({ deck: { _id: String(deck._id), name: deck.name } }, { status: 201 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Failed to create deck" }, { status: 500 });
	}
};
