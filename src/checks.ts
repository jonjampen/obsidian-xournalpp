import { Notice } from "obsidian";
import { exec } from 'child_process';

export async function checkXoppSetup(): Promise<string> {
    let aliasPath = "xournalpp";
    let windowsPath = '"c:/Program Files/Xournal++/bin/xournalpp.exe"';
    let versionCmd = " --version";

    try {
        await executeCommand(aliasPath + versionCmd);
        return aliasPath;
    } catch (error) {
        console.error(`Error with Xournal++ setup (${aliasPath}): ${error.message}`);
    }
    
    try {
        await executeCommand(windowsPath + versionCmd);
        return windowsPath;
    } catch (error) {
        console.error(`Error with Xournal++ setup (${windowsPath}): ${error.message}`);
    }

    new Notice("Error: Xournal++ path not setup correctly. Please check docs on how to set it up.", 10000);
    return "error";
}

function executeCommand(command: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        exec(command, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}