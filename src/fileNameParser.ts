import XoppPlugin from "main";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";

import { shorthands } from "./shorthands";

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
    ...shorthands
        .find((group) => group.title === "Date & Time")!
        .shorthands.map((s) => ({
            match: new RegExp(`(?<!\\$)\\$\\{${s.shorthand}\\}`, "g"),
            substitution: () => {
                dayjs.extend(advancedFormat);
                dayjs.extend(weekOfYear);
                dayjs.extend(isoWeek);

                return dayjs().format(s.shorthand);
            },
        })),
];

export interface ParsedFileName {
    text: string;
    cursorIndex?: number;
}

export default function parseFileName(template: string, plugin: XoppPlugin): ParsedFileName {
    for (const substitution of SUBSTITUTIONS) {
        const replacement = substitution.substitution(plugin);
        template = template.replace(substitution.match, replacement);
    }

    let cursorIndex: number | undefined = undefined;
    const cursorRegex = /(?<!\$)\${cursor}/;
    const cursorMatch = cursorRegex.exec(template);
    if (cursorMatch) {
        cursorIndex = cursorMatch.index;
        template = template.replace(cursorRegex, ""); // remove ${cursor}
    }

    return { text: template, cursorIndex };
}
