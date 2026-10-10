// Card tags and subtopics, shared by the API routes and the pages
import { IMAGE_URL_PATTERN } from "./cardImages";

export const CARD_TAGS = ["definition", "numerical", "visual"] as const;
export type CardTag = (typeof CARD_TAGS)[number];

export const CARD_TAG_LABELS: Record<CardTag, string> = {
	definition: "Definition",
	numerical: "Numerical",
	visual: "Visual",
};

export const MAX_SUBTOPICS = 20;
export const MAX_SUBTOPIC_LENGTH = 100;

export const isCardTag = (value: unknown): value is CardTag => CARD_TAGS.includes(value as CardTag);

// Trims, drops blanks and duplicates. Returns null if the input isn't a list of strings.
export const cleanSubtopics = (value: unknown): string[] | null => {
	if (value === undefined) return [];
	if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) return null;
	const cleaned = value.map((item: string) => item.trim().slice(0, MAX_SUBTOPIC_LENGTH)).filter(Boolean);
	return [...new Set(cleaned)].slice(0, MAX_SUBTOPICS);
};

type CardInput = {
	front: string;
	back: string;
	frontImage: string | null;
	backImage: string | null;
	tag: CardTag;
	subtopics: string[];
};

const parseText = (value: unknown) => (value === undefined || value === null ? "" : typeof value === "string" ? value.trim() : null);
const parseImage = (value: unknown) =>
	value === undefined || value === null || value === "" ? null : typeof value === "string" && IMAGE_URL_PATTERN.test(value) ? value : false;

// Validates a create/edit card request body. Each side needs text, an image, or both.
export const parseCardInput = (body: Record<string, unknown>): { card: CardInput } | { error: string } => {
	const front = parseText(body.front);
	const back = parseText(body.back);
	const frontImage = parseImage(body.frontImage);
	const backImage = parseImage(body.backImage);
	if (front === null || back === null) return { error: "Front and back must be text" };
	if (frontImage === false || backImage === false) return { error: "Invalid image" };
	if (!front && !frontImage) return { error: "Front needs text or an image" };
	if (!back && !backImage) return { error: "Back needs text or an image" };
	if (!isCardTag(body.tag)) return { error: "Pick a tag: Definition, Numerical or Visual" };
	const subtopics = cleanSubtopics(body.subtopics);
	if (!subtopics) return { error: "Subtopics must be a list of text" };
	return { card: { front, back, frontImage, backImage, tag: body.tag, subtopics } };
};
