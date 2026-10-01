import { ChildProcess, spawn } from "child_process";

export function parseCommandLine(commandLine: string): { command: string; args: string[] } {
    const trimmedCommandLine = commandLine.trim();
    if (/^(?:[A-Za-z]:[\\/]|\/).*(?:\.exe|\/xournalpp)$/i.test(trimmedCommandLine)) {
        return { command: trimmedCommandLine, args: [] };
    }

    const tokens: string[] = [];
    let token = "";
    let quote: '"' | "'" | null = null;

    for (const character of trimmedCommandLine) {
        if (quote) {
            if (character === quote) {
                quote = null;
            } else {
                token += character;
            }
        } else if (character === '"' || character === "'") {
            quote = character;
        } else if (/\s/.test(character)) {
            if (token) {
                tokens.push(token);
                token = "";
            }
        } else {
            token += character;
        }
    }

    if (quote) throw new Error("The Xournal++ path contains an unmatched quote.");
    if (token) tokens.push(token);
    if (tokens.length === 0) throw new Error("The Xournal++ path is empty.");

    return { command: tokens[0], args: tokens.slice(1) };
}

export function spawnXournalpp(commandLine: string, args: string[]): ChildProcess {
    const command = parseCommandLine(commandLine);
    return spawn(command.command, [...command.args, ...args], { shell: false });
}

export function runXournalpp(commandLine: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        let child: ChildProcess;
        try {
            child = spawnXournalpp(commandLine, args);
        } catch (error) {
            reject(toError(error));
            return;
        }

        let settled = false;
        const fail = (error: unknown) => {
            if (settled) return;
            settled = true;
            reject(toError(error));
        };

        child.once("error", fail);
        child.once("close", (code) => {
            if (settled) return;
            settled = true;
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Xournal++ exited with code ${code ?? "unknown"}.`));
            }
        });
    });
}

function toError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}
