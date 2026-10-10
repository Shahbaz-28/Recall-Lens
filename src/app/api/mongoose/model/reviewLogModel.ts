import mongoose, { Schema, Model, Types } from "mongoose";

// One row per review. Used for the daily new-card limit, and can later feed
// the FSRS optimizer to personalise scheduling parameters.
export interface IReviewLog {
	userId: string;
	deckId: Types.ObjectId;
	cardId: Types.ObjectId;
	rating: number;
	state: number; // card state *before* this review
	due: Date;
	stability: number;
	difficulty: number;
	elapsed_days: number;
	last_elapsed_days: number;
	scheduled_days: number;
	learning_steps: number;
	review: Date;
}

const reviewLogSchema = new Schema<IReviewLog>({
	userId: { type: String, required: true },
	deckId: { type: Schema.Types.ObjectId, ref: "Deck", required: true },
	cardId: { type: Schema.Types.ObjectId, ref: "Card", required: true },
	rating: { type: Number, required: true },
	state: { type: Number, required: true },
	due: { type: Date, required: true },
	stability: Number,
	difficulty: Number,
	elapsed_days: Number,
	last_elapsed_days: Number,
	scheduled_days: Number,
	learning_steps: Number,
	review: { type: Date, required: true },
});

reviewLogSchema.index({ userId: 1, deckId: 1, review: 1 });

const ReviewLog: Model<IReviewLog> =
	mongoose.models.ReviewLog || mongoose.model<IReviewLog>("ReviewLog", reviewLogSchema);

export default ReviewLog;
