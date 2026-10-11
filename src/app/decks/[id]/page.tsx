"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ui } from "@/components/ui";
import { PencilIcon, PlayIcon, StackIcon, TrashIcon } from "@/components/icons";
import ImageInput from "@/components/ImageInput";
import { api } from "@/lib/apiClient";
import type { CardItem, DeckSummary } from "@/lib/types";
import { CardTag } from "@/lib/cardTags";
import CardMetaFields, { SubtopicChip, TagBadge } from "./CardMetaFields";
import AddCardForm from "../AddCardForm";

const STATE_LABELS = ["New", "Learning", "Review", "Relearning"];

const describeDue = (card: CardItem) => {
	if (card.state === 0) return "New";
	const due = new Date(card.due);
	if (due.getTime() <= Date.now()) return "Due now";
	return `Due ${due.toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
};

const CardThumb = ({ src, alt }: { src: string; alt: string }) => (
	// eslint-disable-next-line @next/next/no-img-element
	<img
		src={src}
		alt={alt}
		loading="lazy"
		className="mt-2 max-h-28 max-w-full rounded-md border border-border bg-surface-muted object-contain"
	/>
);

const CountPill =({ value, label, className }: { value: number; label: string; className: string }) => (
	<span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${className}`}>
		<span className="tabular-nums font-semibold">{value}</span> {label}
	</span>
);

const DeckPage = () => {
	const { id } = useParams<{ id: string }>();
	const [deck, setDeck] = useState<DeckSummary | null>(null);
	const [cards, setCards] = useState<CardItem[] | null>(null);
	const [error, setError] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editFront, setEditFront] = useState("");
	const [editBack, setEditBack] = useState("");
	const [editFrontImage, setEditFrontImage] = useState<string | null>(null);
	const [editBackImage, setEditBackImage] = useState<string | null>(null);
	const [editFrontUploading, setEditFrontUploading] = useState(false);
	const [editBackUploading, setEditBackUploading] = useState(false);
	const [editTag, setEditTag] = useState<CardTag | "">("");
	const [editSubtopics, setEditSubtopics] = useState<string[]>([]);
	const [cardToDelete, setCardToDelete] = useState<CardItem | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Each side needs text or an image; wait for uploads to finish before saving
	const canSaveEdit =
		Boolean(editFront.trim() || editFrontImage) &&
		Boolean(editBack.trim() || editBackImage) &&
		Boolean(editTag) &&
		!editFrontUploading &&
		!editBackUploading;

	const load = useCallback(async () => {
		try {
			const [deckData, cardData] = await Promise.all([
				api<{ deck: DeckSummary }>(`/api/decks/${id}`),
				api<{ cards: CardItem[] }>(`/api/decks/${id}/cards`),
			]);
			setDeck(deckData.deck);
			setCards(cardData.cards);
			setError("");
		} catch (e) {
			setError((e as Error).message);
		}
	}, [id]);

	useEffect(() => {
		load();
	}, [load]);

	const saveEdit = async (cardId: string) => {
		if (!canSaveEdit) return;
		try {
			await api(`/api/cards/${cardId}`, {
				method: "PATCH",
				body: {
					front: editFront,
					back: editBack,
					frontImage: editFrontImage,
					backImage: editBackImage,
					tag: editTag,
					subtopics: editSubtopics,
				},
			});
			setEditingId(null);
			await load();
		} catch (e) {
			setError((e as Error).message);
		}
	};

	const deleteCard = async () => {
		if (!cardToDelete) return;
		setDeleting(true);
		try {
			await api(`/api/cards/${cardToDelete._id}`, { method: "DELETE" });
			setCardToDelete(null);
			await load();
		} catch (e) {
			setError((e as Error).message);
			setCardToDelete(null);
		} finally {
			setDeleting(false);
		}
	};

	const textareaClass = `${ui.input} resize-y`;

	return (
		<>
			<AppHeader />
			<main className={ui.page}>
				<nav className="flex items-center gap-1.5 text-sm text-muted">
					<Link href="/decks" className="hover:text-foreground">
						Decks
					</Link>
					<span>/</span>
					<span className="truncate text-foreground">{deck?.name ?? "…"}</span>
				</nav>

				{error && <p className={`${ui.error} mt-4`}>{error}</p>}

				<div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0">
						<h1 className="truncate text-2xl sm:text-3xl font-semibold tracking-tight">{deck?.name ?? "Loading…"}</h1>
						{deck && (
							<div className="mt-3 flex flex-wrap gap-2">
								<CountPill
									value={deck.counts.new}
									label="new"
									className="bg-accent-soft text-accent ring-accent/20"
								/>
								<CountPill
									value={deck.counts.learning}
									label="learning"
									className="bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30"
								/>
								<CountPill
									value={deck.counts.review}
									label="to review"
									className="bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
								/>
								<CountPill value={deck.counts.total} label="total" className="bg-surface text-muted ring-border" />
							</div>
						)}
					</div>
					<Link href={`/decks/${id}/study`} className={`${ui.buttonPrimary} px-5 py-2.5`}>
						<PlayIcon className="h-4 w-4" /> Study now
					</Link>
				</div>

				<div className="mt-8 grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
					<AddCardForm
						deckId={id}
						onAdded={load}
						className={`${ui.panel} p-5 lg:sticky lg:top-20`}
						header={
							<div>
								<h2 className="font-semibold">Add a card</h2>
								<p className="mt-0.5 text-xs text-muted">Write a question and its answer.</p>
							</div>
						}
					/>

					<section>
						<div className="mb-3 flex items-baseline justify-between">
							<h2 className="font-semibold">Cards</h2>
							<span className="text-sm text-muted">{cards?.length ?? 0}</span>
						</div>

						{cards === null && !error && (
							<div className="space-y-3">
								{[0, 1, 2].map((i) => (
									<div key={i} className="h-20 animate-pulse rounded-xl bg-surface-muted" />
								))}
							</div>
						)}

						{cards?.length === 0 && (
							<div className={`${ui.panel} flex flex-col items-center border-dashed px-6 py-14 text-center`}>
								<span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
									<StackIcon className="h-5 w-5" />
								</span>
								<p className="mt-3 font-medium">No cards yet</p>
								<p className="mt-1 text-sm text-muted">Use the form to add your first card.</p>
							</div>
						)}

						<ul className="space-y-3">
							{cards?.map((card) =>
								editingId === card._id ? (
									<li key={card._id} className={`${ui.panel} space-y-4 p-5 ring-2 ring-accent/30`}>
										<div>
											<label className={ui.label}>Front</label>
											<textarea
												value={editFront}
												onChange={(e) => setEditFront(e.target.value)}
												rows={2}
												className={textareaClass}
											/>
											<div className="mt-2">
												<ImageInput
													label="front image"
													value={editFrontImage}
													onChange={setEditFrontImage}
													onBusyChange={setEditFrontUploading}
												/>
											</div>
										</div>
										<div>
											<label className={ui.label}>Back</label>
											<textarea
												value={editBack}
												onChange={(e) => setEditBack(e.target.value)}
												rows={2}
												className={textareaClass}
											/>
											<div className="mt-2">
												<ImageInput
													label="back image"
													value={editBackImage}
													onChange={setEditBackImage}
													onBusyChange={setEditBackUploading}
												/>
											</div>
										</div>
										<CardMetaFields
											tag={editTag}
											onTagChange={setEditTag}
											subtopics={editSubtopics}
											onSubtopicsChange={setEditSubtopics}
										/>
										<div className="flex gap-2">
											<button
												onClick={() => saveEdit(card._id)}
												disabled={!canSaveEdit}
												className={ui.buttonPrimary}
											>
												Save
											</button>
											<button onClick={() => setEditingId(null)} className={ui.buttonSecondary}>
												Cancel
											</button>
										</div>
									</li>
								) : (
									<li key={card._id} className={`${ui.panel} group p-4 sm:p-5 transition-shadow hover:shadow-md`}>
										<div className="flex items-start justify-between gap-4">
											<div className="min-w-0 flex-1">
												{card.front && <p className="font-medium whitespace-pre-wrap break-words">{card.front}</p>}
												{card.frontImage && <CardThumb src={card.frontImage} alt="Front image" />}
												{card.back && (
													<p className="mt-1 text-sm text-muted whitespace-pre-wrap break-words">{card.back}</p>
												)}
												{card.backImage && <CardThumb src={card.backImage} alt="Back image" />}
											</div>
											<div className="flex shrink-0 items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
												<button
													onClick={() => {
														setEditingId(card._id);
														setEditFront(card.front);
														setEditBack(card.back);
														setEditFrontImage(card.frontImage);
														setEditBackImage(card.backImage);
														setEditTag(card.tag ?? "");
														setEditSubtopics(card.subtopics);
													}}
													aria-label="Edit card"
													title="Edit"
													className={ui.buttonGhost}
												>
													<PencilIcon />
												</button>
												<button
													onClick={() => setCardToDelete(card)}
													aria-label="Delete card"
													title="Delete"
													className={ui.buttonDanger}
												>
													<TrashIcon />
												</button>
											</div>
										</div>
										<div className="mt-3 flex flex-wrap items-center gap-1.5">
											{card.tag && <TagBadge tag={card.tag} />}
											{card.subtopics.map((subtopic) => (
												<SubtopicChip key={subtopic}>{subtopic}</SubtopicChip>
											))}
											<span
												className="ml-auto text-xs text-muted"
												title={`${STATE_LABELS[card.state]} · ${card.reps} reviews · ${card.lapses} lapses`}
											>
												{describeDue(card)}
											</span>
										</div>
									</li>
								)
							)}
						</ul>
					</section>
				</div>
			</main>

			<ConfirmDialog
				open={cardToDelete !== null}
				title="Delete card?"
				description={
					cardToDelete && (
						<>
							<span className="font-medium text-foreground line-clamp-2">
								{cardToDelete.front ? <>&ldquo;{cardToDelete.front}&rdquo;</> : "Image card"}
							</span>
							<span className="mt-1 block">
								This card and its review history will be permanently deleted. This can&apos;t be undone.
							</span>
						</>
					)
				}
				confirmLabel="Delete card"
				busy={deleting}
				onConfirm={deleteCard}
				onCancel={() => setCardToDelete(null)}
			/>
		</>
	);
};

export default DeckPage;
