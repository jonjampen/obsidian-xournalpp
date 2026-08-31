import { Notice, Platform } from "obsidian";
import { exec } from "child_process";
import XoppPlugin from "src/main";

export async function checkXoppSetup(plugin: XoppPlugin): Promise<string | null> {
    const errors = [];
    const userPath = plugin.settings.xournalppPath;
    const aliasPath = "xournalpp";
    const windowsPath = '"c:/Program Files/Xournal++/bin/xournalpp.exe"';
    const macPath = '"/Applications/Xournal++.app/Contents/MacOS/xournalpp"';
    const versionCmd = " --version";

    if (userPath) {
        try {
            await executeCommand(userPath + versionCmd);
            return userPath;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push("User defined Xournal++ path not working: " + message);
        }
    }

    try {
        await executeCommand(aliasPath + versionCmd);
        return aliasPath;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(message);
    }

    if (Platform.isWin) {
        try {
            await executeCommand(windowsPath + versionCmd);
            return windowsPath;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push(message);
        }
    }

    if (Platform.isMacOS) {
        try {
            await executeCommand(macPath + versionCmd);
            return macPath;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push(message);
        }
    }

    new Notice("Error: Xournal++ path not setup correctly. Please check docs on how to set it up.", 10000);
    errors.forEach((error) => console.error("Xournal++ Error:" + error));
    return null;
}

function executeCommand(command: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        exec(command, (error) => {
            if (error) {
                reject(error instanceof Error ? error : new Error(String(error)));
            } else {
                resolve();
            }
        });
    });
}
