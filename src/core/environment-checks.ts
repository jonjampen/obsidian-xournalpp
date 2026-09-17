import { Notice, Platform } from "obsidian";
import XoppPlugin from "src/main";
import { runXournalpp } from "../utils/xournalpp-process";

export async function checkXoppSetup(plugin: XoppPlugin): Promise<string> {
    const errors = [];
    const userPath = plugin.settings.xournalppPath;
    const aliasPath = "xournalpp";
    const windowsPath = "c:/Program Files/Xournal++/bin/xournalpp.exe";
    const macPath = "/Applications/Xournal++.app/Contents/MacOS/xournalpp";

    if (userPath) {
        try {
            await runXournalpp(userPath, ["--version"]);
            return userPath;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push("User defined Xournal++ path not working: " + message);
        }
    }

    try {
        await runXournalpp(aliasPath, ["--version"]);
        return aliasPath;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(message);
    }

    if (Platform.isWin) {
        try {
            await runXournalpp(windowsPath, ["--version"]);
            return windowsPath;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push(message);
        }
    }

    if (Platform.isMacOS) {
        try {
            await runXournalpp(macPath, ["--version"]);
            return macPath;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push(message);
        }
    }

    new Notice("Error: Xournal++ path not setup correctly. Please check docs on how to set it up.", 10000);
    errors.forEach((error) => console.error("Xournal++ Error:" + error));
    return "error";
}
