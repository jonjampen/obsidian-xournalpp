import XoppPlugin from "main";
import { findCorrespondingXoppToPdf, openXournalppFile } from "./xoppActions";
import { TFile } from "obsidian";

export function addOpenInXournalpp(plugin: XoppPlugin) {
    let fileExplorers = plugin.app.workspace.getLeavesOfType("file-explorer");

    fileExplorers.forEach(fileExplorer => {
        let allFiles = (fileExplorer.view as any)?.fileItems;

        if (!allFiles) {
            console.error("No file items found in file explorer.");
            return;
        }

        const files: Array<Array<HTMLElement | TFile>> = [];
        Object.entries(allFiles).forEach(([filePath, value]) => {
            if (filePath.endsWith(".pdf")) {
                let xoppFile = findCorrespondingXoppToPdf(filePath as string, plugin);
                if (xoppFile) {
                    const tagEl = (value as any).tagEl as HTMLElement;
                    if (!tagEl) {
                        console.error(`No tagEl found for file path: ${filePath}`);
                    } else {
                        files.push([tagEl, xoppFile]);
                    }
                }
            }
        });

        files.forEach(([div, file]: [HTMLElement, TFile]) => {
            if (div) {
                div.innerText = "X++";
                div.classList.add("clickable-tag");
                div.onclick = () => {
                    openXournalppFile(file, plugin);
                };
            } else {
                console.error("Element is null for file:", file);
            }
        });
    });
}