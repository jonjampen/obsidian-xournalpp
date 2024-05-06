import { Notice, TFile } from "obsidian";
import { findCorrespondingXoppToPdf, openXournalppFile } from "./xoppActions";
import { createXoppFileModal } from "./modal";
import XoppPlugin from "main";
import { exportXoppToPDF } from "./xopp2pdf";

export function createCommands(plugin: XoppPlugin) {
    plugin.addCommand({
        id: 'xournalpp:open-in-xournalpp',
        name: 'Open current file in Xournal++',
        checkCallback: (checking: boolean) => {
            let pdfFilePath = plugin.app.workspace.getActiveFile()?.path
            if (!pdfFilePath || plugin.app.workspace.getActiveFile()?.extension !== "pdf") return false;

            let xoppFile = findCorrespondingXoppToPdf(pdfFilePath, plugin)
            if (!xoppFile) return false;

            if (!checking) openXournalppFile(xoppFile, plugin.app);
            return true;
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

    plugin.addCommand({
        id: 'xournalpp:export-current-xournalpp-to-pdf',
        name: 'Update current PDF from Xournal++',
        checkCallback: (checking: boolean) => {
            let filePath = plugin.app.workspace.getActiveFile()?.path as string;

            if (filePath.includes(".pdf")) {
                if (!checking) {
                    filePath = filePath?.replace(".pdf", ".xopp");
                    exportXoppToPDF(plugin, [filePath]);
                }
                return true;
            }
            return false;
        }
    });

}