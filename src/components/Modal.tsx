"use client";
import React, { useEffect } from "react";
import { ui } from "./ui";

type Props = {
	open: boolean;
	onClose: () => void;
	title: React.ReactNode;
	description?: React.ReactNode;
	children: React.ReactNode;
};

// Dialog shell: backdrop, Escape to close, scrollable body. A bottom sheet on phones.
const Modal = ({ open, onClose, title, description, children }: Props) => {
	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKeyDown);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = "";
		};
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				className={`${ui.panel} relative flex max-h-[92vh] w-full flex-col rounded-b-none shadow-xl sm:max-w-lg sm:rounded-b-xl`}
			>
				<div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
					<div className="min-w-0">
						<h2 id="modal-title" className="font-semibold">
							{title}
						</h2>
						{description && <div className="mt-0.5 text-sm text-muted">{description}</div>}
					</div>
					<button
						onClick={onClose}
						aria-label="Close"
						className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-lg text-muted hover:bg-surface-muted hover:text-foreground"
					>
						×
					</button>
				</div>
				<div className="overflow-y-auto px-5 py-5">{children}</div>
			</div>
		</div>
	);
};

export default Modal;
