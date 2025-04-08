import { Notice, Platform } from "obsidian";
import { exec } from 'child_process';
import XoppPlugin from "main";

export async function checkXoppSetup(plugin: XoppPlugin): Promise<string> {
    let errors = []
    let userPath = plugin.settings.xournalppPath;
    let aliasPath = "xournalpp";
    let windowsPath = '"c:/Program Files/Xournal++/bin/xournalpp.exe"';
    let macPath = '"/Applications/Xournal++.app/Contents/MacOS/xournalpp"';
    let versionCmd = " --version";

    if (userPath) {
        try {
			await executeCommand(userPath + versionCmd);
        	return userPath;
		} catch (error) {
            errors.push("User defined Xournal++ path not working: " + error.message)
        }
    }
     
    try {
        await executeCommand(aliasPath + versionCmd);
        return aliasPath;
    } catch (error) {
        errors.push(error.message)
    }
    
    if (Platform.isWin) {
        try {
            await executeCommand(windowsPath + versionCmd);
            return windowsPath;
        } catch (error) {
            errors.push(error.message)
        }
    }

    if (Platform.isMacOS) {
        try {
            await executeCommand(macPath + versionCmd);
            return macPath;
        } catch (error) {
            errors.push(error.message)
        }
    }

    new Notice("Error: Xournal++ path not setup correctly. Please check docs on how to set it up.", 10000);
    errors.forEach(error => console.error("Xournal++ Error:" + error))
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
