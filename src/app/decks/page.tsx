"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ui } from "@/components/ui";
import { PencilIcon, PlayIcon, PlusIcon, StackIcon, TrashIcon } from "@/components/icons";
import { api } from "@/lib/apiClient";
import type { DeckSummary } from "@/lib/types";

const StatCard = ({ label, value, accent }: { label: string; value: number | string; accent: string }) => (
	<div className={`${ui.panel} p-4 sm:p-5`}>
		<p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
		<p className={`mt-1 text-2xl sm:text-3xl font-semibold tabular-nums ${accent}`}>{value}</p>
	</div>
);

const DecksPage = () => {
	const [decks, setDecks] = useState<DeckSummary[] | null>(null);
	const [error, setError] = useState("");
	const [showCreate, setShowCreate] = useState(false);
	const [newName, setNewName] = useState("");
	const [creating, setCreating] = useState(false);
	const [renamingId, setRenamingId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const [deckToDelete, setDeckToDelete] = useState<DeckSummary | null>(null);
	const [deleting, setDeleting] = useState(false);

	const loadDecks = useCallback(async () => {
		try {
			const data = await api<{ decks: DeckSummary[] }>("/api/decks");
			setDecks(data.decks);
			setError("");
		} catch (e) {
			setError((e as Error).message);
		}
	}, []);

	useEffect(() => {
		loadDecks();
	}, [loadDecks]);

	const createDeck = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newName.trim()) return;
		setCreating(true);
		try {
			await api("/api/decks", { method: "POST", body: { name: newName } });
			setNewName("");
			setShowCreate(false);
			await loadDecks();
		} catch (e) {
			setError((e as Error).message);
		} finally {
			setCreating(false);
		}
	};

	const renameDeck = async (id: string) => {
		if (!renameValue.trim()) return;
		try {
			await api(`/api/decks/${id}`, { method: "PATCH", body: { name: renameValue } });
			setRenamingId(null);
			await loadDecks();
		} catch (e) {
			setError((e as Error).message);
		}
	};

	const deleteDeck = async () => {
		if (!deckToDelete) return;
		setDeleting(true);
		try {
			await api(`/api/decks/${deckToDelete._id}`, { method: "DELETE" });
			setDeckToDelete(null);
			await loadDecks();
		} catch (e) {
			setError((e as Error).message);
			setDeckToDelete(null);
		} finally {
			setDeleting(false);
		}
	};

	const totals = (decks ?? []).reduce(
		(sum, deck) => ({
			due: sum.due + deck.counts.learning + deck.counts.review,
			new: sum.new + deck.counts.new,
			cards: sum.cards + deck.counts.total,
		}),
		{ due: 0, new: 0, cards: 0 }
	);

	return (
		<>
			<AppHeader />
			<main className={ui.page}>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Decks</h1>
						<p className="mt-1 text-sm text-muted">Review what&apos;s due today and keep your memory sharp.</p>
					</div>
					<button onClick={() => setShowCreate((open) => !open)} className={ui.buttonPrimary}>
						<PlusIcon /> New deck
					</button>
				</div>

				{showCreate && (
					<form onSubmit={createDeck} className={`${ui.panel} mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center`}>
						<input
							autoFocus
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							onKeyDown={(e) => e.key === "Escape" && setShowCreate(false)}
							placeholder="Deck name, e.g. Physics — Mechanics"
							maxLength={100}
							className={ui.input}
						/>
						<div className="flex gap-2">
							<button type="submit" disabled={creating || !newName.trim()} className={ui.buttonPrimary}>
								{creating ? "Creating…" : "Create"}
							</button>
							<button type="button" onClick={() => setShowCreate(false)} className={ui.buttonSecondary}>
								Cancel
							</button>
						</div>
					</form>
				)}

				{error && <p className={`${ui.error} mt-6`}>{error}</p>}

				<div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
					<StatCard label="Due today" value={decks ? totals.due : "—"} accent="text-emerald-600 dark:text-emerald-400" />
					<StatCard label="New today" value={decks ? totals.new : "—"} accent="text-accent" />
					<StatCard label="Total cards" value={decks ? totals.cards : "—"} accent="text-foreground" />
				</div>

				<section className={`${ui.panel} mt-6 overflow-hidden`}>
					<div className="hidden sm:grid grid-cols-[1fr_5rem_5rem_5rem_12rem] gap-2 border-b border-border bg-surface-muted/60 px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-muted">
						<span>Deck</span>
						<span className="text-right">Due</span>
						<span className="text-right">New</span>
						<span className="text-right">Cards</span>
						<span />
					</div>

					{decks === null && !error && (
						<div className="space-y-3 p-5">
							{[0, 1, 2].map((i) => (
								<div key={i} className="h-10 animate-pulse rounded-lg bg-surface-muted" />
							))}
						</div>
					)}

					{decks?.length === 0 && (
						<div className="flex flex-col items-center px-6 py-16 text-center">
							<span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
								<StackIcon className="h-6 w-6" />
							</span>
							<h2 className="mt-4 font-semibold">No decks yet</h2>
							<p className="mt-1 max-w-sm text-sm text-muted">
								Create your first deck, add a few cards, and start studying.
							</p>
							<button onClick={() => setShowCreate(true)} className={`${ui.buttonPrimary} mt-5`}>
								<PlusIcon /> Create a deck
							</button>
						</div>
					)}

					<ul className="divide-y divide-border">
						{decks?.map((deck) => {
							const due = deck.counts.learning + deck.counts.review;
							return (
								<li
									key={deck._id}
									className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_5rem_5rem_5rem_12rem] items-center gap-2 px-4 sm:px-5 py-3.5 transition-colors hover:bg-surface-muted/50"
								>
									{renamingId === deck._id ? (
										<input
											autoFocus
											value={renameValue}
											onChange={(e) => setRenameValue(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") renameDeck(deck._id);
												if (e.key === "Escape") setRenamingId(null);
											}}
											onBlur={() => setRenamingId(null)}
											className={ui.input}
										/>
									) : (
										<div className="min-w-0">
											<Link href={`/decks/${deck._id}`} className="block truncate font-medium hover:text-accent">
												{deck.name}
											</Link>
											<p className="mt-0.5 text-xs text-muted sm:hidden">
												<span className="text-emerald-600 dark:text-emerald-400">{due} due</span> ·{" "}
												<span className="text-accent">{deck.counts.new} new</span> · {deck.counts.total} cards
											</p>
										</div>
									)}
									<span
										className={`hidden sm:block text-right tabular-nums font-medium ${
											due ? "text-emerald-600 dark:text-emerald-400" : "text-muted/60"
										}`}
									>
										{due}
									</span>
									<span
										className={`hidden sm:block text-right tabular-nums font-medium ${
											deck.counts.new ? "text-accent" : "text-muted/60"
										}`}
									>
										{deck.counts.new}
									</span>
									<span className="hidden sm:block text-right tabular-nums text-muted">{deck.counts.total}</span>
									<div className="flex items-center justify-end gap-1">
										<Link href={`/decks/${deck._id}/study`} className={`${ui.buttonPrimary} px-3 py-1.5`}>
											<PlayIcon className="h-3.5 w-3.5" /> Study
										</Link>
										<button
											onClick={() => {
												setRenamingId(deck._id);
												setRenameValue(deck.name);
											}}
											aria-label={`Rename ${deck.name}`}
											title="Rename"
											className={ui.buttonGhost}
										>
											<PencilIcon />
										</button>
										<button
											onClick={() => setDeckToDelete(deck)}
											aria-label={`Delete ${deck.name}`}
											title="Delete"
											className={ui.buttonDanger}
										>
											<TrashIcon />
										</button>
									</div>
								</li>
							);
						})}
					</ul>
				</section>
			</main>

			<ConfirmDialog
				open={deckToDelete !== null}
				title="Delete deck?"
				description={
					deckToDelete && (
						<>
							<span className="font-medium text-foreground">&ldquo;{deckToDelete.name}&rdquo;</span> and all{" "}
							{deckToDelete.counts.total} of its cards will be permanently deleted, along with their review
							history. This can&apos;t be undone.
						</>
					)
				}
				confirmLabel="Delete deck"
				busy={deleting}
				onConfirm={deleteDeck}
				onCancel={() => setDeckToDelete(null)}
			/>
		</>
	);
};

export default DecksPage;
