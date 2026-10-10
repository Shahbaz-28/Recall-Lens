"use client";
import React, { useState } from "react";
import { CARD_TAGS, CARD_TAG_LABELS, CardTag, MAX_SUBTOPICS, MAX_SUBTOPIC_LENGTH } from "@/lib/cardTags";
import { ui } from "@/components/ui";

export const TAG_BADGE_CLASSES: Record<CardTag, string> = {
	definition: "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-500/30",
	numerical: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
	visual: "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/30",
};

export const TagBadge = ({ tag }: { tag: CardTag }) => (
	<span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TAG_BADGE_CLASSES[tag]}`}>
		{CARD_TAG_LABELS[tag]}
	</span>
);

export const SubtopicChip = ({ children }: { children: React.ReactNode }) => (
	<span className="inline-flex items-center rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted ring-1 ring-inset ring-border">
		{children}
	</span>
);

type Props = {
	tag: CardTag | "";
	onTagChange: (tag: CardTag) => void;
	subtopics: string[];
	onSubtopicsChange: (subtopics: string[]) => void;
};

// Tag picker (exactly one required) + subtopic list, used when adding and editing cards
const CardMetaFields = ({ tag, onTagChange, subtopics, onSubtopicsChange }: Props) => {
	const [draft, setDraft] = useState("");

	const addDraft = () => {
		const value = draft.trim().slice(0, MAX_SUBTOPIC_LENGTH);
		if (value && !subtopics.includes(value) && subtopics.length < MAX_SUBTOPICS) {
			onSubtopicsChange([...subtopics, value]);
		}
		setDraft("");
	};

	return (
		<>
			<div>
				<p className={ui.label}>
					Tag <span className="text-red-500">*</span>
				</p>
				<div role="radiogroup" aria-label="Card tag" className="grid grid-cols-3 gap-1 rounded-lg bg-surface-muted p-1">
					{CARD_TAGS.map((option) => (
						<button
							key={option}
							type="button"
							role="radio"
							aria-checked={tag === option}
							onClick={() => onTagChange(option)}
							className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
								tag === option
									? "bg-surface text-foreground shadow-sm ring-1 ring-border"
									: "text-muted hover:text-foreground"
							}`}
						>
							{CARD_TAG_LABELS[option]}
						</button>
					))}
				</div>
				{!tag && <p className="mt-1.5 text-xs text-muted">Choose one tag for this card.</p>}
			</div>

			<div>
				<p className={ui.label}>
					Subtopics <span className="font-normal text-muted">(optional)</span>
				</p>
				<div className="flex gap-2">
					<input
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === ",") {
								e.preventDefault();
								addDraft();
							}
						}}
						onBlur={addDraft}
						placeholder="Type a subtopic and press Enter"
						maxLength={MAX_SUBTOPIC_LENGTH}
						disabled={subtopics.length >= MAX_SUBTOPICS}
						className={ui.input}
					/>
					<button type="button" onClick={addDraft} disabled={!draft.trim()} className={ui.buttonSecondary}>
						Add
					</button>
				</div>
				{subtopics.length > 0 && (
					<div className="mt-2 flex flex-wrap gap-1.5">
						{subtopics.map((subtopic) => (
							<span
								key={subtopic}
								className="inline-flex items-center gap-1 rounded-md bg-accent-soft py-0.5 pl-2 pr-1 text-xs font-medium text-accent"
							>
								{subtopic}
								<button
									type="button"
									onClick={() => onSubtopicsChange(subtopics.filter((item) => item !== subtopic))}
									aria-label={`Remove ${subtopic}`}
									className="grid h-4 w-4 place-items-center rounded hover:bg-accent/15"
								>
									×
								</button>
							</span>
						))}
					</div>
				)}
			</div>
		</>
	);
};

export default CardMetaFields;
