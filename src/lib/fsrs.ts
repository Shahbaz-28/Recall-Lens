import { fsrs, generatorParameters, Card as FsrsCard, State } from "ts-fsrs";
import type { ICard } from "@/app/api/mongoose/model/cardModel";

// Default FSRS parameters (same as Anki's), with fuzz so cards don't clump on one day
export const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

export const NEW_CARDS_PER_DAY = 20;

// Like Anki: when nothing else is left, show learning cards due within the next 20 minutes
export const LEARN_AHEAD_MS = 20 * 60 * 1000;

export const toFsrsCard = (card: ICard): FsrsCard => ({
	due: card.due,
	stability: card.stability,
	difficulty: card.difficulty,
	elapsed_days: card.elapsed_days,
	scheduled_days: card.scheduled_days,
	learning_steps: card.learning_steps,
	reps: card.reps,
	lapses: card.lapses,
	state: card.state as State,
	last_review: card.last_review ?? undefined,
});

export const startOfToday = () => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today;
};

// "1 min", "10 min", "3 hours", "1 day", "4 days", "2.5 months", "1.2 years"
export const formatInterval = (from: Date, to: Date) => {
	const plural = (value: number, unit: string) => `${value} ${unit}${value === 1 ? "" : "s"}`;
	const minutes = Math.max(1, Math.round((to.getTime() - from.getTime()) / 60000));
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return plural(hours, "hour");
	const days = Math.round(minutes / 1440);
	if (days < 30) return plural(days, "day");
	if (days < 365) return plural(+(days / 30).toFixed(1), "month");
	return plural(+(days / 365).toFixed(1), "year");
};

export { State };
