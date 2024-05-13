import XoppPlugin from "main";
import { findCorrespondingXoppToPdf, openXournalppFile } from "./xoppActions";
import { TFile } from "obsidian";

export function addOpenInXournalpp(plugin: XoppPlugin) {
    let fileExplorers = plugin.app.workspace.getLeavesOfType("file-explorer");

    fileExplorers.forEach(fileExplorer => {
        let allFiles = (fileExplorer.view as any)?.fileItems;

        const files:Array<Array<HTMLElement|TFile>> = [];
        Object.entries(allFiles).forEach(([filePath, value]) => {
            if (filePath.endsWith(".pdf")) {
                let xoppFile = findCorrespondingXoppToPdf(filePath as string, plugin)
                if (xoppFile) files.push([(value as any).tagEl as HTMLElement, xoppFile]);
            }
        });

        files.forEach(([div, file]: [HTMLElement, TFile]) => {
                div.innerText = "X++";
                div.classList.add("clickable-tag");
                div.onclick = () => {
                    openXournalppFile(file, plugin.app);
                }                                
        })
    })
}