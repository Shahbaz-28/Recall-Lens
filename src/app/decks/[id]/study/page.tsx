"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { ui } from "@/components/ui";
import { ArrowLeftIcon, CheckIcon, StackIcon } from "@/components/icons";
import { api } from "@/lib/apiClient";
import type { NextCardResponse, StudyIntervals } from "@/lib/types";
import { SubtopicChip, TagBadge } from "../CardMetaFields";

// Ratings map to FSRS grades: 1 Again, 2 Hard, 3 Good, 4 Easy
const ANSWER_BUTTONS: { rating: number; label: string; key: keyof StudyIntervals; className: string }[] = [
	{ rating: 1, label: "Extra Hard", key: "again", className: "bg-red-600 hover:bg-red-700" },
	{ rating: 2, label: "Hard", key: "hard", className: "bg-orange-500 hover:bg-orange-600" },
	{ rating: 3, label: "Medium", key: "good", className: "bg-blue-600 hover:bg-blue-700" },
	{ rating: 4, label: "Easy", key: "easy", className: "bg-emerald-600 hover:bg-emerald-700" },
];

const StudyImage = ({ src, alt }: { src: string; alt: string }) => (
	// eslint-disable-next-line @next/next/no-img-element
	<img
		src={src}
		alt={alt}
		className="mx-auto mt-4 max-h-80 max-w-full rounded-lg border border-border bg-surface-muted object-contain"
	/>
);

const Kbd =({ children }: { children: React.ReactNode }) => (
	<kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] text-muted">
		{children}
	</kbd>
);

const StudyPage = () => {
	const { id } = useParams<{ id: string }>();
	const [data, setData] = useState<NextCardResponse | null>(null);
	const [showAnswer, setShowAnswer] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [reviewedCount, setReviewedCount] = useState(0);
	const [error, setError] = useState("");

	const loadNext = useCallback(async () => {
		try {
			setData(await api<NextCardResponse>(`/api/decks/${id}/next`));
			setShowAnswer(false);
			setError("");
		} catch (e) {
			setError((e as Error).message);
		}
	}, [id]);

	useEffect(() => {
		loadNext();
	}, [loadNext]);

	// Buttons stay disabled until the next card has loaded, so a rating can't be sent twice
	const answer = useCallback(
		async (rating: number) => {
			if (!data?.card || submitting) return;
			setSubmitting(true);
			try {
				await api(`/api/cards/${data.card._id}/review`, { method: "POST", body: { rating } });
				setReviewedCount((count) => count + 1);
				await loadNext();
			} catch (e) {
				setError((e as Error).message);
			} finally {
				setSubmitting(false);
			}
		},
		[data, submitting, loadNext]
	);

	// Space shows the answer, 1-4 pick a rating
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (!data?.card || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
			if (e.key === " " && !showAnswer) {
				e.preventDefault();
				setShowAnswer(true);
			} else if (showAnswer && ["1", "2", "3", "4"].includes(e.key)) {
				answer(Number(e.key));
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [data, showAnswer, answer]);

	const cardsLeft = data ? data.counts.new + data.counts.learning + data.counts.review : 0;
	const progress = reviewedCount + cardsLeft > 0 ? (reviewedCount / (reviewedCount + cardsLeft)) * 100 : 0;

	return (
		<>
			<AppHeader />
			<main className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-6 sm:py-10">
				<div className="flex items-center justify-between gap-3">
					<Link
						href={`/decks/${id}`}
						className="inline-flex min-w-0 items-center gap-1.5 text-sm text-muted hover:text-foreground"
					>
						<ArrowLeftIcon className="h-4 w-4 shrink-0" />
						<span className="truncate">{data?.deck.name ?? "Back"}</span>
					</Link>
					{data?.card && (
						<span className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted ring-1 ring-border">
							Cards left today: <span className="tabular-nums font-semibold text-foreground">{cardsLeft}</span>
						</span>
					)}
				</div>

				{data?.card && (
					<div className="mt-4 h-1 overflow-hidden rounded-full bg-surface-muted">
						<div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
					</div>
				)}

				{error && <p className={`${ui.error} mt-4`}>{error}</p>}

				{!data && !error && <div className="mt-6 h-72 animate-pulse rounded-2xl bg-surface-muted" />}

				{data && !data.card && data.counts.total === 0 && (
					<div className={`${ui.panel} mt-6 flex flex-col items-center px-6 py-14 text-center`}>
						<span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
							<StackIcon className="h-6 w-6" />
						</span>
						<h1 className="mt-4 text-lg font-semibold">This deck has no cards yet</h1>
						<p className="mt-1 text-sm text-muted">Add some cards to start studying.</p>
						<Link href={`/decks/${id}`} className={`${ui.buttonPrimary} mt-6`}>
							Add cards
						</Link>
					</div>
				)}

				{data && !data.card && data.counts.total > 0 && (
					<div className={`${ui.panel} mt-6 flex flex-col items-center px-6 py-14 text-center`}>
						<span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/5">
							<CheckIcon className="h-6 w-6" />
						</span>
						<h1 className="mt-5 text-xl font-semibold tracking-tight">You&apos;re done for today</h1>
						<p className="mt-2 text-sm text-muted">
							Cards reviewed: <span className="font-semibold text-foreground tabular-nums">{reviewedCount}</span>
						</p>
						{data.nextDue && (
							<p className="mt-1 text-xs text-muted">Next card is due {new Date(data.nextDue).toLocaleString()}.</p>
						)}
						<Link href="/decks" className={`${ui.buttonPrimary} mt-6`}>
							Back to decks
						</Link>
					</div>
				)}

				{data?.card && (
					<div className={`${ui.panel} mt-6 overflow-hidden rounded-2xl shadow-md`}>
						<div className="flex min-h-[18rem] flex-col p-6 sm:p-10">
							{(data.card.tag || data.card.subtopics.length > 0) && (
								<div className="mb-6 flex flex-wrap justify-center gap-1.5">
									{data.card.tag && <TagBadge tag={data.card.tag} />}
									{data.card.subtopics.map((subtopic) => (
										<SubtopicChip key={subtopic}>{subtopic}</SubtopicChip>
									))}
								</div>
							)}
							<div className="flex flex-1 flex-col justify-center text-center">
								{data.card.front && (
									<p className="text-xl sm:text-2xl font-medium leading-relaxed whitespace-pre-wrap break-words">
										{data.card.front}
									</p>
								)}
								{data.card.frontImage && <StudyImage src={data.card.frontImage} alt="Question image" />}
								{showAnswer && (
									<>
										<div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted">
											<span className="h-px flex-1 bg-border" />
											Answer
											<span className="h-px flex-1 bg-border" />
										</div>
										{data.card.back && (
											<p className="text-lg sm:text-xl leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
												{data.card.back}
											</p>
										)}
										{data.card.backImage && <StudyImage src={data.card.backImage} alt="Answer image" />}
									</>
								)}
							</div>
						</div>

						<div className="border-t border-border bg-surface-muted/50 p-3 sm:p-4">
							{!showAnswer ? (
								<button onClick={() => setShowAnswer(true)} className={`${ui.buttonPrimary} w-full py-3 text-base`}>
									Show answer
									<span className="hidden sm:inline-flex">
										<kbd className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">Space</kbd>
									</span>
								</button>
							) : (
								<div className="grid grid-cols-4 gap-1.5 sm:gap-2">
									{ANSWER_BUTTONS.map((button) => (
										<button
											key={button.rating}
											onClick={() => answer(button.rating)}
											disabled={submitting}
											className={`${button.className} flex flex-col items-center rounded-lg px-1 py-2 sm:py-2.5 text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent`}
										>
											<span className="text-sm sm:text-base font-semibold leading-tight">{button.label}</span>
											<span className="mt-0.5 text-[11px] sm:text-xs opacity-85">{data.intervals?.[button.key]}</span>
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				)}

				{data?.card && (
					<p className="mt-4 hidden sm:flex items-center justify-center gap-2 text-xs text-muted">
						<Kbd>Space</Kbd> show answer <span className="mx-1">·</span> <Kbd>1</Kbd>
						<Kbd>2</Kbd>
						<Kbd>3</Kbd>
						<Kbd>4</Kbd> rate
					</p>
				)}
			</main>
		</>
	);
};

export default StudyPage;
