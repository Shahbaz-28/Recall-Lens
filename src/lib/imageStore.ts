import Image from "@/app/api/mongoose/model/imageModel";
import { imageKeyFromUrl } from "./cardImages";

// Deletes the user's stored images behind the given /api/images/... URLs
export const deleteImages = async (userId: string, urls: (string | null | undefined)[]) => {
	const keys = urls.map(imageKeyFromUrl).filter((key): key is string => Boolean(key));
	if (keys.length) await Image.deleteMany({ userId, key: { $in: keys } });
};
