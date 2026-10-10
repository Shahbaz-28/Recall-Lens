import { NextRequest, NextResponse } from "next/server";
import { Rating } from "ts-fsrs";
import { connectToDatabase } from "../../../mongoose/mongoose";
import Card from "../../../mongoose/model/cardModel";
import { requireUser } from "@/lib/serverAuth";
import { findUserDeck, getDeckCounts } from "@/lib/decks";
import { LEARN_AHEAD_MS, State, formatInterval, scheduler, toFsrsCard } from "@/lib/fsrs";

type Params = { params: Promise<{ id: string }> };

// The next card to study, plus how long each answer button would push it out
export const GET = async (req: NextRequest, { params }: Params) => {
	try {
		const userId = await requireUser(req);
		if (userId instanceof NextResponse) return userId;
		const { id } = await params;
		await connectToDatabase();

		const deck = await findUserDeck(userId, id);
		if (!deck) return NextResponse.json({ message: "Deck not found" }, { status: 404 });

		const now = new Date();
		const counts = (await getDeckCounts(userId, [deck._id])).get(id)!;
		const base = { userId, deckId: deck._id };

		// 1. learning/review cards that are due now, most overdue first
		let card = await Card.findOne({ ...base, state: { $ne: State.New }, due: { $lte: now } }).sort({ due: 1 });
		// 2. new cards, oldest first, while today's new-card limit lasts
		if (!card && counts.new > 0) card = await Card.findOne({ ...base, state: State.New }).sort({ createdAt: 1 });
		// 3. learning cards coming up within the learn-ahead window
		if (!card)
			card = await Card.findOne({
				...base,
				state: { $in: [State.Learning, State.Relearning] },
				due: { $lte: new Date(now.getTime() + LEARN_AHEAD_MS) },
			}).sort({ due: 1 });

		const deckInfo = { _id: id, name: deck.name };

		if (!card) {
			const upcoming = await Card.findOne({ ...base, state: { $ne: State.New } }).sort({ due: 1 }).lean();
			return NextResponse.json({
				deck: deckInfo,
				counts,
				card: null,
				intervals: null,
				nextDue: upcoming?.due ?? null,
			});
		}

		const preview = scheduler.repeat(toFsrsCard(card), now);
		return NextResponse.json({
			deck: deckInfo,
			counts,
			card: {
				_id: String(card._id),
				front: card.front,
				back: card.back,
				frontImage: card.frontImage ?? null,
				backImage: card.backImage ?? null,
				tag: card.tag ?? null,
				subtopics: card.subtopics ?? [],
				state: card.state,
			},
			intervals: {
				again: formatInterval(now, preview[Rating.Again].card.due),
				hard: formatInterval(now, preview[Rating.Hard].card.due),
				good: formatInterval(now, preview[Rating.Good].card.due),
				easy: formatInterval(now, preview[Rating.Easy].card.due),
			},
			nextDue: null,
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Failed to load next card" }, { status: 500 });
	}
};
