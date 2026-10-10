"use client";
import React, { useEffect, useRef } from "react";
import { ui } from "./ui";
import { TrashIcon } from "./icons";

type Props = {
	open: boolean;
	title: string;
	description: React.ReactNode;
	confirmLabel?: string;
	busy?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
};

// Modal for destructive actions (delete deck / delete card)
const ConfirmDialog = ({ open, title, description, confirmLabel = "Delete", busy = false, onConfirm, onCancel }: Props) => {
	const cancelRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (open) cancelRef.current?.focus();
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && !busy) onCancel();
		};
		document.addEventListener("keydown", onKeyDown);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = "";
		};
	}, [open, busy, onCancel]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={() => !busy && onCancel()}
				aria-hidden="true"
			/>
			<div
				role="alertdialog"
				aria-modal="true"
				aria-labelledby="confirm-title"
				aria-describedby="confirm-description"
				className={`${ui.panel} relative w-full max-w-md p-6 shadow-xl`}
			>
				<div className="flex gap-4">
					<span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
						<TrashIcon className="h-5 w-5" />
					</span>
					<div className="min-w-0">
						<h2 id="confirm-title" className="font-semibold">
							{title}
						</h2>
						<div id="confirm-description" className="mt-1.5 text-sm text-muted break-words">
							{description}
						</div>
					</div>
				</div>
				<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<button ref={cancelRef} onClick={onCancel} disabled={busy} className={ui.buttonSecondary}>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						disabled={busy}
						className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					>
						{busy ? "Deleting…" : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmDialog;
