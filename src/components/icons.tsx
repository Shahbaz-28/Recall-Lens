import React from "react";

type IconProps = { className?: string };

const Icon = ({ className = "h-4 w-4", children }: IconProps & { children: React.ReactNode }) => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		className={className}
	>
		{children}
	</svg>
);

export const PlusIcon = (props: IconProps) => (
	<Icon {...props}>
		<path d="M12 5v14M5 12h14" />
	</Icon>
);

export const PlayIcon = (props: IconProps) => (
	<Icon {...props}>
		<path d="M7 5l12 7-12 7V5z" />
	</Icon>
);

export const PencilIcon = (props: IconProps) => (
	<Icon {...props}>
		<path d="M4 20h4L19 9l-4-4L4 16v4z" />
	</Icon>
);

export const TrashIcon = (props: IconProps) => (
	<Icon {...props}>
		<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
	</Icon>
);

export const ArrowLeftIcon = (props: IconProps) => (
	<Icon {...props}>
		<path d="M19 12H5M11 6l-6 6 6 6" />
	</Icon>
);

export const StackIcon = (props: IconProps) => (
	<Icon {...props}>
		<path d="M12 3l9 5-9 5-9-5 9-5z" />
		<path d="M3 13l9 5 9-5" />
	</Icon>
);

export const ImageIcon = (props: IconProps) => (
	<Icon {...props}>
		<rect x="3" y="4" width="18" height="16" rx="2" />
		<circle cx="9" cy="10" r="1.5" />
		<path d="M21 16l-5-5-9 9" />
	</Icon>
);

export const CheckIcon = (props: IconProps) => (
	<Icon {...props}>
		<path d="M5 12l5 5L20 7" />
	</Icon>
);
