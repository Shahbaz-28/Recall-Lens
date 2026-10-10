// Shared Tailwind class strings so every page uses the same buttons, inputs and panels

const focusRing =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const buttonBase = `inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`;

export const ui = {
	page: "mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 sm:py-10",
	panel: "rounded-xl border border-border bg-surface shadow-sm",
	buttonPrimary: `${buttonBase} bg-accent text-accent-foreground hover:bg-accent-hover px-4 py-2 shadow-sm`,
	buttonSecondary: `${buttonBase} border border-border bg-surface text-foreground hover:bg-surface-muted px-4 py-2`,
	buttonGhost: `${buttonBase} text-muted hover:text-foreground hover:bg-surface-muted px-2.5 py-1.5`,
	buttonDanger: `${buttonBase} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 px-2.5 py-1.5`,
	input:
		"w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted shadow-sm transition-colors focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20",
	label: "block text-sm font-medium text-foreground mb-1.5",
	error:
		"rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
};
