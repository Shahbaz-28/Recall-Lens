import mongoose, { Schema, Model, Types } from "mongoose";

export interface IDeck {
	_id: Types.ObjectId;
	userId: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
}

const deckSchema = new Schema<IDeck>(
	{
		userId: { type: String, required: true, index: true },
		name: { type: String, required: true, trim: true, maxlength: 100 },
	},
	{ timestamps: true }
);

const Deck: Model<IDeck> = mongoose.models.Deck || mongoose.model<IDeck>("Deck", deckSchema);

export default Deck;
