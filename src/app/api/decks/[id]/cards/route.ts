import { NextRequest, NextResponse } from "next/server";
import { createEmptyCard } from "ts-fsrs";
import { connectToDatabase } from "../../../mongoose/mongoose";
import Card from "../../../mongoose/model/cardModel";
import { requireUser } from "@/lib/serverAuth";
import { findUserDeck } from "@/lib/decks";
import { parseCardInput } from "@/lib/cardTags";

type Params = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ message: "Deck not found" }, { status: 404 });

// List the cards in a deck, newest first
export const GET = async (req: NextRequest, { params }: Params) => {
	try {
		const userId = await requireUser(req);
		if (userId instanceof NextResponse) return userId;
		const { id } = await params;
		await connectToDatabase();

		const deck = await findUserDeck(userId, id);
		if (!deck) return notFound();
		const cards = await Card.find({ userId, deckId: deck._id }).sort({ createdAt: -1 }).lean();
		return NextResponse.json({
			cards: cards.map((card) => ({
				_id: String(card._id),
				front: card.front,
				back: card.back,
				frontImage: card.frontImage ?? null,
				backImage: card.backImage ?? null,
				tag: card.tag ?? null,
				subtopics: card.subtopics ?? [],
				state: card.state,
				due: card.due,
				reps: card.reps,
				lapses: card.lapses,
			})),
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Failed to load cards" }, { status: 500 });
	}
};

// Add a card: { front, back, frontImage, backImage, tag, subtopics }. It starts as a brand-new FSRS card.
export const POST = async (req: NextRequest, { params }: Params) => {
	try {
		const userId = await requireUser(req);
		if (userId instanceof NextResponse) return userId;
		const { id } = await params;
		const input = parseCardInput(await req.json());
		if ("error" in input) return NextResponse.json({ message: input.error }, { status: 400 });

		await connectToDatabase();
		const deck = await findUserDeck(userId, id);
		if (!deck) return notFound();

		const card = await Card.create({
			...createEmptyCard(new Date()),
			...input.card,
			userId,
			deckId: deck._id,
		});
		return NextResponse.json({ card: { _id: String(card._id) } }, { status: 201 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Failed to add card" }, { status: 500 });
	}
};
