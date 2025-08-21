import XoppPlugin from "main";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";

import { newFilePlaceholders } from "./newFilePlaceholders";

interface templateSubstitution {
    match: RegExp;
    substitution: (plugin: XoppPlugin) => string;
}

const SUBSTITUTIONS: templateSubstitution[] = [
    {
        match: /(?<!\$)\${fname}/g,
        substitution: (plugin: XoppPlugin): string => {
            const currentfile = plugin.app.workspace.getActiveFile();
            let currentfilename = "";
            if (currentfile) {
                currentfilename = currentfile.basename;
            }
            return currentfilename;
        },
    },
    ...newFilePlaceholders
        .find((group) => group.title === "Date & Time")!
        .placeholders.map((p) => ({
            match: new RegExp(`(?<!\\$)\\$\\{${p.pattern}\\}`, "g"),
            substitution: () => {
                dayjs.extend(advancedFormat);
                dayjs.extend(weekOfYear);
                dayjs.extend(isoWeek);

                return dayjs().format(p.pattern);
            },
        })),
];

export interface ParsedFileName {
    text: string;
    cursorIndex?: number;
}

export default function parseFileName(
    template: string,
    plugin: XoppPlugin,
    showCursor: boolean = false
): ParsedFileName {
    for (const substitution of SUBSTITUTIONS) {
        const replacement = substitution.substitution(plugin);
        template = template.replace(substitution.match, replacement);
    }

    let cursorIndex: number | undefined = undefined;
    const cursorRegex = /(?<!\$)\${cursor}/;
    const cursorMatch = cursorRegex.exec(template);
    if (cursorMatch) {
        cursorIndex = cursorMatch.index;
        template = template.replace(cursorRegex, showCursor ? "\u275A" : ""); // remove ${cursor}
    }

    return { text: template, cursorIndex };
}
