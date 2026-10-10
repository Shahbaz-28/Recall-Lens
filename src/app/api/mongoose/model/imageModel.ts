import mongoose, { Schema, Model } from "mongoose";

// An uploaded card image, stored in MongoDB and served by /api/images/[key]
export interface IImage {
	key: string;
	userId: string;
	contentType: string;
	data: Buffer;
	size: number;
	createdAt: Date;
}

const imageSchema = new Schema<IImage>(
	{
		key: { type: String, required: true, unique: true },
		userId: { type: String, required: true, index: true },
		contentType: { type: String, required: true },
		data: { type: Buffer, required: true },
		size: { type: Number, required: true },
	},
	{ timestamps: { createdAt: true, updatedAt: false } }
);

const Image: Model<IImage> = mongoose.models.Image || mongoose.model<IImage>("Image", imageSchema);

export default Image;
