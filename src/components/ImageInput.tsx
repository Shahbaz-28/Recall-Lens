"use client";
import React, { useEffect, useRef, useState } from "react";
import { uploadImage } from "@/lib/apiClient";
import { compressImage } from "@/lib/compressImage";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/cardImages";
import { ImageIcon } from "./icons";

type Props = {
	value: string | null;
	onChange: (url: string | null) => void;
	onBusyChange?: (busy: boolean) => void;
	label: string; // used for accessibility, e.g. "front image"
};

// Optional card image: click to choose, drag & drop, or paste (Ctrl+V) while focused
const ImageInput = ({ value, onChange, onBusyChange, label }: Props) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [dragging, setDragging] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		onBusyChange?.(uploading);
	}, [uploading, onBusyChange]);

	const handleFile = async (file: File | undefined | null) => {
		if (!file) return;
		if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
			setError("Use a PNG, JPEG, WebP or GIF image.");
			return;
		}
		setError("");
		setUploading(true);
		try {
			const blob = await compressImage(file);
			if (blob.size > MAX_IMAGE_BYTES) throw new Error("Image is too large (max 5 MB).");
			onChange(await uploadImage(blob));
		} catch (e) {
			setError((e as Error).message);
		} finally {
			setUploading(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	if (value) {
		return (
			<div className="relative inline-block max-w-full">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={value}
					alt={label}
					className="max-h-48 max-w-full rounded-lg border border-border bg-surface-muted object-contain"
				/>
				<button
					type="button"
					onClick={() => onChange(null)}
					aria-label={`Remove ${label}`}
					className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
				>
					×
				</button>
			</div>
		);
	}

	return (
		<div>
			<div
				role="button"
				tabIndex={0}
				aria-label={`Add ${label}`}
				onClick={() => !uploading && inputRef.current?.click()}
				onKeyDown={(e) => {
					if ((e.key === "Enter" || e.key === " ") && !uploading) {
						e.preventDefault();
						inputRef.current?.click();
					}
				}}
				onPaste={(e) => {
					const file = Array.from(e.clipboardData.files).find((item) => item.type.startsWith("image/"));
					if (file) {
						e.preventDefault();
						handleFile(file);
					}
				}}
				onDragOver={(e) => {
					e.preventDefault();
					setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDragging(false);
					handleFile(e.dataTransfer.files[0]);
				}}
				className={`flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
					dragging
						? "border-accent bg-accent-soft text-accent"
						: "border-border text-muted hover:border-accent/60 hover:text-foreground"
				} ${uploading ? "cursor-wait opacity-70" : "cursor-pointer"}`}
			>
				<ImageIcon className="h-4 w-4 shrink-0" />
				{uploading ? "Uploading…" : <span>Add image — click, drop or paste</span>}
			</div>
			<input
				ref={inputRef}
				type="file"
				accept={ALLOWED_IMAGE_TYPES.join(",")}
				className="hidden"
				onChange={(e) => handleFile(e.target.files?.[0])}
			/>
			{error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
		</div>
	);
};

export default ImageInput;
