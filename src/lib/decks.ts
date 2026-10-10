import mongoose, { Types } from "mongoose";
import Deck from "@/app/api/mongoose/model/deckModel";
import Card from "@/app/api/mongoose/model/cardModel";
import ReviewLog from "@/app/api/mongoose/model/reviewLogModel";
import { LEARN_AHEAD_MS, NEW_CARDS_PER_DAY, State, startOfToday } from "./fsrs";
import type { DeckCounts } from "./types";

export const findUserDeck = async (userId: string, deckId: string) => {
	if (!mongoose.isValidObjectId(deckId)) return null;
	return Deck.findOne({ _id: deckId, userId });
};

// Anki-style counts per deck: new (capped by today's limit), learning and review cards due now
export const getDeckCounts = async (userId: string, deckIds: Types.ObjectId[]) => {
	const now = new Date();
	const learnAhead = new Date(now.getTime() + LEARN_AHEAD_MS);
	const match = { userId, deckId: { $in: deckIds } };

	const [cardStats, newStudiedToday] = await Promise.all([
		Card.aggregate([
			{ $match: match },
			{
				$group: {
					_id: "$deckId",
					total: { $sum: 1 },
					newTotal: { $sum: { $cond: [{ $eq: ["$state", State.New] }, 1, 0] } },
					learning: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $in: ["$state", [State.Learning, State.Relearning]] },
										{ $lte: ["$due", learnAhead] },
									],
								},
								1,
								0,
							],
						},
					},
					review: {
						$sum: {
							$cond: [{ $and: [{ $eq: ["$state", State.Review] }, { $lte: ["$due", now] }] }, 1, 0],
						},
					},
				},
			},
		]),
		ReviewLog.aggregate([
			{ $match: { ...match, state: State.New, review: { $gte: startOfToday() } } },
			{ $group: { _id: "$deckId", count: { $sum: 1 } } },
		]),
	]);

	const studiedByDeck = new Map(newStudiedToday.map((row) => [String(row._id), row.count as number]));
	const counts = new Map<string, DeckCounts>();
	for (const id of deckIds) {
		counts.set(String(id), { new: 0, learning: 0, review: 0, total: 0 });
	}
	for (const row of cardStats) {
		const id = String(row._id);
		const newLeftToday = Math.max(0, NEW_CARDS_PER_DAY - (studiedByDeck.get(id) ?? 0));
		counts.set(id, {
			new: Math.min(row.newTotal, newLeftToday),
			learning: row.learning,
			review: row.review,
			total: row.total,
		});
	}
	return counts;
};
