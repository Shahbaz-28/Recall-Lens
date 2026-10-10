// Shapes returned by the deck/card API routes
import type { CardTag } from "./cardTags";

export type DeckCounts = {
	new: number;
	learning: number;
	review: number;
	total: number;
};

export type DeckSummary = {
	_id: string;
	name: string;
	counts: DeckCounts;
};

export type CardItem = {
	_id: string;
	front: string;
	back: string;
	frontImage: string | null;
	backImage: string | null;
	tag: CardTag | null;
	subtopics: string[];
	state: number;
	due: string;
	reps: number;
	lapses: number;
};

export type StudyIntervals = {
	again: string;
	hard: string;
	good: string;
	easy: string;
};

export type NextCardResponse = {
	deck: { _id: string; name: string };
	counts: DeckCounts;
	card: {
		_id: string;
		front: string;
		back: string;
		frontImage: string | null;
		backImage: string | null;
		tag: CardTag | null;
		subtopics: string[];
		state: number;
	} | null;
	intervals: StudyIntervals | null;
	nextDue: string | null;
};
