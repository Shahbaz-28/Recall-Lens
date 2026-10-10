import mongoose, { Schema, Model, Types } from "mongoose";
import { CARD_TAGS, CardTag } from "@/lib/cardTags";

// A flashcard plus its FSRS scheduling state (field names match ts-fsrs's Card)
export interface ICard {
	_id: Types.ObjectId;
	userId: string;
	deckId: Types.ObjectId;
	front: string;
	back: string;
	frontImage?: string | null; // /api/images/<key>
	backImage?: string | null;
	tag?: CardTag; // required for new cards; older cards may not have one
	subtopics: string[];
	due: Date;
	stability: number;
	difficulty: number;
	elapsed_days: number;
	scheduled_days: number;
	learning_steps: number;
	reps: number;
	lapses: number;
	state: number; // 0 New, 1 Learning, 2 Review, 3 Relearning
	last_review?: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

const cardSchema = new Schema<ICard>(
	{
		userId: { type: String, required: true },
		deckId: { type: Schema.Types.ObjectId, ref: "Deck", required: true },
		// each side needs text or an image (checked in parseCardInput), so text may be empty
		front: { type: String, default: "" },
		back: { type: String, default: "" },
		frontImage: { type: String, default: null },
		backImage: { type: String, default: null },
		tag: { type: String, enum: CARD_TAGS },
		subtopics: { type: [String], default: [] },
		due: { type: Date, required: true },
		stability: { type: Number, default: 0 },
		difficulty: { type: Number, default: 0 },
		elapsed_days: { type: Number, default: 0 },
		scheduled_days: { type: Number, default: 0 },
		learning_steps: { type: Number, default: 0 },
		reps: { type: Number, default: 0 },
		lapses: { type: Number, default: 0 },
		state: { type: Number, default: 0 },
		last_review: { type: Date, default: null },
	},
	{ timestamps: true }
);

cardSchema.index({ userId: 1, deckId: 1, state: 1, due: 1 });

const Card: Model<ICard> = mongoose.models.Card || mongoose.model<ICard>("Card", cardSchema);

export default Card;
