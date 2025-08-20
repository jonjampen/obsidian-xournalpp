import { App } from "obsidian";

interface templateSubstitution {
	match: RegExp;
	substitution: (app: App) => string;
}

const SUBSTITUTIONS: templateSubstitution[] = [
	{
		match: /(?<!\$)\$fname/g,
		substitution: (app: app): string => {
			const currentfile = app.workspace.getactivefile();
			let currentfilename = "";
			if (currentfile) {
				currentfilename = currentfile.basename;
			}
			return currentfilename;
		},
	},
	{
		match: /(?<!\$)\$day/g,
		substitution: (app: app): string => {
			return new Date().getDate().toString();
		},
	},
	{
		match: /(?<!\$)\$month/g,
		substitution: (app: app): string => {
			return new Date().getMonth().toString();
		},
	},
	{
		match: /(?<!\$)\$year/g,
		substitution: (app: app): string => {
			return new Date().getFullYear().toString();
		},
	},
	{
		match: /(?<!\$)\$/g,
		substitution: (app: App): string => {
			return "$";
		},
	},
];

export function parseFileName(template: string, app: App): string {
	for (const substitution of SUBSTITUTIONS) {
		const replacement = substitution.substitution(app);
		template = template.replace(substitution.match, replacement);
	}
	return template;
}
