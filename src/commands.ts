import { Notice } from "obsidian";
import { openXournalppFile } from "./xoppActions";
import { createXoppFileModal } from "./modal";
import XoppPlugin from "main";

export function createCommands(plugin: XoppPlugin) {
    plugin.addCommand({
        id: 'xournalpp:open-in-xournalpp',
        name: 'Open current file in Xournal++',
        callback: () => {
            let pdfFilePath = plugin.app.workspace.getActiveFile()?.path
            
            if (!pdfFilePath || plugin.app.workspace.getActiveFile()?.extension !== "pdf") {
                new Notice("Error: This file does not have a corresponding .xopp file.")
                return
            }

            let xoppFile = plugin.findCorrespondingXoppToPdf(pdfFilePath)
            
            if (!xoppFile) {
                new Notice("Error: This file does not have a corresponding .xopp file.")
                return;
            }

            openXournalppFile(xoppFile, plugin.app);
        }
    });
    
    plugin.addCommand({
        id: 'xournalpp:crate-new-xournalpp',
        name: 'Create a new Xournal++ note',
        callback: async () => {
            new createXoppFileModal(plugin.app, plugin)
                .setTitle("Create a new Xournal++ note")
                .open()
        }
    });

}