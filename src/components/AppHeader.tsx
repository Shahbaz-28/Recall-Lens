"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { ui } from "./ui";

const NAV_LINKS = [{ href: "/decks", label: "Decks" }];

const AppHeader = () => {
	const [user, setUser] = useState<User | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const pathname = usePathname();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			// TEMP-AUTH-BYPASS: when login is back on, send signed-out users to sign-in here:
			// if (!currentUser) return router.push("/auth/signIn");
			setUser(currentUser);
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (!menuOpen) return;
		const onClick = (e: MouseEvent) => {
			if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
		};
		document.addEventListener("mousedown", onClick);
		return () => document.removeEventListener("mousedown", onClick);
	}, [menuOpen]);

	const displayName = user?.displayName || user?.email || "Guest";
	const initial = displayName.charAt(0).toUpperCase();

	return (
		<header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
			<div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
				<div className="flex items-center gap-6">
					<Link href="/decks" className="flex items-center gap-2 font-semibold tracking-tight">
						<span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-accent-foreground text-sm shadow-sm">
							A
						</span>
						<span className="hidden sm:inline">ReCall Lens</span>
					</Link>
					<nav className="flex items-center gap-1">
						{NAV_LINKS.map((link) => {
							const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
							return (
								<Link
									key={link.href}
									href={link.href}
									className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
										active ? "bg-surface-muted text-foreground" : "text-muted hover:text-foreground"
									}`}
								>
									{link.label}
								</Link>
							);
						})}
					</nav>
				</div>

				<div className="relative" ref={menuRef}>
					<button
						onClick={() => setMenuOpen((open) => !open)}
						aria-label="Account menu"
						aria-expanded={menuOpen}
						className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-accent text-sm font-semibold ring-1 ring-border hover:ring-accent transition"
					>
						{initial}
					</button>
					{menuOpen && (
						<div className={`${ui.panel} absolute right-0 mt-2 w-64 p-1 shadow-lg`}>
							<div className="px-3 py-2.5 border-b border-border mb-1">
								<p className="text-sm font-medium truncate">{displayName}</p>
								<p className="text-xs text-muted truncate">{user?.email ?? "Not signed in"}</p>
							</div>
							{user && (
								<button
									onClick={() => signOut(auth)}
									className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
								>
									Log out
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default AppHeader;
