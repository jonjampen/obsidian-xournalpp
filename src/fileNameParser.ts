import XoppPlugin from "main";

interface templateSubstitution {
	match: RegExp;
	substitution: (plugin: XoppPlugin) => string;
}

const SUBSTITUTIONS: templateSubstitution[] = [
	{
		// replace double $ with null byte at start to allow for consecutive $
		// will be replaced by single $ at end
		match: /\$\$/g,
		substitution: (plugin: XoppPlugin): string => {
			return "\u0000";
		},
	},
	{
		match: /(?<!\$)\$fname/g,
		substitution: (plugin: XoppPlugin): string => {
			const currentfile = plugin.app.workspace.getActiveFile();
			let currentfilename = "";
			if (currentfile) {
				currentfilename = currentfile.basename;
			}
			return currentfilename;
		},
	},
	{
		match: /(?<!\$)\$day/g,
		substitution: (plugin: XoppPlugin): string => {
			return new Date().getDate().toString();
		},
	},
	{
		match: /(?<!\$)\$month/g,
		substitution: (plugin: XoppPlugin): string => {
			return new Date().getMonth().toString();
		},
	},
	{
		match: /(?<!\$)\$year/g,
		substitution: (plugin: XoppPlugin): string => {
			return new Date().getFullYear().toString();
		},
	},
	{
		match: /\u0000/g,
		substitution: (plugin: XoppPlugin): string => {
			return "$";
		},
	},
];

export default function parseFileName(
	template: string,
	plugin: XoppPlugin,
): string {
	for (const substitution of SUBSTITUTIONS) {
		const replacement = substitution.substitution(plugin);
		template = template.replace(substitution.match, replacement);
	}
	return template;
}
