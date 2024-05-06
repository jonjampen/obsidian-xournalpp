import { Notice, TFile } from "obsidian";
import { findCorrespondingXoppToPdf, openXournalppFile } from "./xoppActions";
import { createXoppFileModal } from "./modal";
import XoppPlugin from "main";
import { exportXoppToPDF } from "./xopp2pdf";

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

            let xoppFile = findCorrespondingXoppToPdf(pdfFilePath, plugin)
            
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

    plugin.addCommand({
        id: 'xournalpp:export-xournalpp-to-pdf',
        name: 'Export all Xournal++ notes to PDF',
        callback: async () => {
            let files = plugin.app.vault.getFiles();
            files = files.filter(file => file.extension === "xopp");
            let filePaths = files.map(file => file.path)
            exportXoppToPDF(plugin, filePaths)
        }
    });

}