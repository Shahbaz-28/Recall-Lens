"use client";
import React, { useState } from "react";
import Modal from "@/components/Modal";
import { ui } from "@/components/ui";
import { CheckIcon, PlusIcon, StackIcon } from "@/components/icons";
import type { DeckSummary } from "@/lib/types";
import AddCardForm from "./AddCardForm";

type Props = {
	decks: DeckSummary[];
	onClose: () => void;
	onAdded: () => void;
	onCreateDeck: () => void;
};

// Home-screen flow: 1) pick a deck  2) fill in the card  3) add another or close.
// Render it only while open so each opening starts fresh.
const AddCardDialog = ({ decks, onClose, onAdded, onCreateDeck }: Props) => {
	// skip the picker when there's only one deck
	const [deckId, setDeckId] = useState<string | null>(decks.length === 1 ? decks[0]._id : null);
	const [addedCount, setAddedCount] = useState(0);

	const deck = decks.find((item) => item._id === deckId);

	return (
		<Modal
			open
			onClose={onClose}
			title={deck ? "Add card" : "Add card — choose a deck"}
			description={
				deck ? (
					<span className="inline-flex flex-wrap items-center gap-x-1.5">
						to <span className="font-medium text-foreground">{deck.name}</span>
						{decks.length > 1 && (
							<button onClick={() => setDeckId(null)} className="text-accent hover:underline">
								Change
							</button>
						)}
					</span>
				) : (
					"Which deck should this card go in?"
				)
			}
		>
			{decks.length === 0 && (
				<div className="flex flex-col items-center py-6 text-center">
					<span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
						<StackIcon className="h-6 w-6" />
					</span>
					<p className="mt-4 font-medium">You don&apos;t have any decks yet</p>
					<p className="mt-1 text-sm text-muted">Cards live inside decks. Create a deck first.</p>
					<button onClick={onCreateDeck} className={`${ui.buttonPrimary} mt-5`}>
						<PlusIcon /> Create a deck
					</button>
				</div>
			)}

			{decks.length > 0 && !deck && (
				<ul className="space-y-2">
					{decks.map((item) => (
						<li key={item._id}>
							<button
								onClick={() => setDeckId(item._id)}
								className="flex w-full items-center gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:border-accent hover:bg-accent-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
							>
								<span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-muted text-muted">
									<StackIcon className="h-4 w-4" />
								</span>
								<span className="min-w-0 flex-1">
									<span className="block truncate font-medium">{item.name}</span>
									<span className="block text-xs text-muted">
										{item.counts.total} {item.counts.total === 1 ? "card" : "cards"}
									</span>
								</span>
								<span className="text-muted">›</span>
							</button>
						</li>
					))}
				</ul>
			)}

			{deck && (
				<>
					{addedCount > 0 && (
						<div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
							<span className="inline-flex items-center gap-2">
								<CheckIcon className="h-4 w-4" />
								{addedCount === 1 ? "Card added." : `${addedCount} cards added.`} Add another or close.
							</span>
							<button onClick={onClose} className="font-medium hover:underline">
								Done
							</button>
						</div>
					)}
					{/* key resets the form when switching decks */}
					<AddCardForm
						key={deck._id}
						deckId={deck._id}
						autoFocus
						onAdded={() => {
							setAddedCount((count) => count + 1);
							onAdded();
						}}
					/>
				</>
			)}
		</Modal>
	);
};

export default AddCardDialog;
