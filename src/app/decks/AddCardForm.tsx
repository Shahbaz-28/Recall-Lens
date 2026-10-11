"use client";
import React, { useId, useState } from "react";
import ImageInput from "@/components/ImageInput";
import { ui } from "@/components/ui";
import { api } from "@/lib/apiClient";
import { CardTag } from "@/lib/cardTags";
import CardMetaFields from "./[id]/CardMetaFields";

type Props = {
	deckId: string;
	onAdded?: () => void;
	header?: React.ReactNode;
	className?: string;
	autoFocus?: boolean;
};

// The "add a card" form, used on the deck page and in the home-screen Add card dialog
const AddCardForm = ({ deckId, onAdded, header, className = "", autoFocus = false }: Props) => {
	const fieldId = useId();
	const [front, setFront] = useState("");
	const [back, setBack] = useState("");
	const [frontImage, setFrontImage] = useState<string | null>(null);
	const [backImage, setBackImage] = useState<string | null>(null);
	const [frontUploading, setFrontUploading] = useState(false);
	const [backUploading, setBackUploading] = useState(false);
	const [tag, setTag] = useState<CardTag | "">("");
	const [subtopics, setSubtopics] = useState<string[]>([]);
	const [adding, setAdding] = useState(false);
	const [error, setError] = useState("");

	// Each side needs text or an image; wait for uploads to finish before saving
	const canAdd =
		Boolean(front.trim() || frontImage) &&
		Boolean(back.trim() || backImage) &&
		Boolean(tag) &&
		!frontUploading &&
		!backUploading;

	const addCard = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canAdd) return;
		setAdding(true);
		try {
			await api(`/api/decks/${deckId}/cards`, {
				method: "POST",
				body: { front, back, frontImage, backImage, tag, subtopics },
			});
			setFront("");
			setBack("");
			setFrontImage(null);
			setBackImage(null);
			setTag("");
			setSubtopics([]);
			setError("");
			onAdded?.();
		} catch (e) {
			setError((e as Error).message);
		} finally {
			setAdding(false);
		}
	};

	const textareaClass = `${ui.input} resize-y`;

	return (
		<form onSubmit={addCard} className={`space-y-4 ${className}`}>
			{header}
			<div>
				<label htmlFor={`${fieldId}-front`} className={ui.label}>
					Front
				</label>
				<textarea
					id={`${fieldId}-front`}
					autoFocus={autoFocus}
					value={front}
					onChange={(e) => setFront(e.target.value)}
					placeholder="Question"
					rows={3}
					className={textareaClass}
				/>
				<div className="mt-2">
					<ImageInput
						label="front image"
						value={frontImage}
						onChange={setFrontImage}
						onBusyChange={setFrontUploading}
					/>
				</div>
			</div>
			<div>
				<label htmlFor={`${fieldId}-back`} className={ui.label}>
					Back
				</label>
				<textarea
					id={`${fieldId}-back`}
					value={back}
					onChange={(e) => setBack(e.target.value)}
					placeholder="Answer"
					rows={3}
					className={textareaClass}
				/>
				<div className="mt-2">
					<ImageInput
						label="back image"
						value={backImage}
						onChange={setBackImage}
						onBusyChange={setBackUploading}
					/>
				</div>
			</div>
			<CardMetaFields tag={tag} onTagChange={setTag} subtopics={subtopics} onSubtopicsChange={setSubtopics} />
			{error && <p className={ui.error}>{error}</p>}
			<button type="submit" disabled={adding || !canAdd} className={`${ui.buttonPrimary} w-full`}>
				{adding ? "Adding…" : "Add card"}
			</button>
		</form>
	);
};

export default AddCardForm;
