import { Editor, Notice, TFile } from "obsidian";
import { findCorrespondingXoppToPdf, openXournalppFile } from "./xoppActions";
import { createXoppFileModal } from "./modal";
import XoppPlugin from "main";
import { exportXoppToPDF } from "./xopp2pdf";

export function createCommands(plugin: XoppPlugin) {
    plugin.addCommand({
        id: 'open-in-xournalpp',
        name: 'Open current note',
        checkCallback: (checking: boolean) => {
            let pdfFilePath = plugin.app.workspace.getActiveFile()?.path
            if (!pdfFilePath || plugin.app.workspace.getActiveFile()?.extension !== "pdf") return false;

            let xoppFile = findCorrespondingXoppToPdf(pdfFilePath, plugin)
            if (!xoppFile) return false;

            if (!checking) openXournalppFile(xoppFile, plugin);
            return true;
        }
    });
    
    plugin.addCommand({
        id: 'crate-new-xournalpp',
        name: 'Create a new note',
        callback: async () => {
            new createXoppFileModal(plugin.app, plugin)
                .setTitle("Create a new Xournal++ note")
                .open()
        }
    });

    plugin.addCommand({
        id: 'crate-new-xournalpp-and-link-xopp',
        name: 'Create a new note and insert XOPP link',
        editorCallback: async (editor: Editor) => {
            new createXoppFileModal(plugin.app, plugin, "", editor, "XOPP")
                .setTitle("Create a new Xournal++ note and insert link")
                .open()      
        }
    });
    
    plugin.addCommand({
        id: 'crate-new-xournalpp-and-link-pdf',
        name: 'Create a new note and insert PDF link',
        editorCallback: async (editor: Editor) => {
            new createXoppFileModal(plugin.app, plugin, "", editor, "PDF")
                .setTitle("Create a new Xournal++ note and insert link")
                .open()      
        }
    });
    
    plugin.addCommand({
        id: 'crate-new-xournalpp-and-link-xopp-pdf',
        name: 'Create a new note and insert PDF and XOPP link',
        editorCallback: async (editor: Editor) => {
            new createXoppFileModal(plugin.app, plugin, "", editor)
                .setTitle("Create a new Xournal++ note and insert link")
                .open()      
        }
    });

    plugin.addCommand({
        id: 'export-xournalpp-to-pdf',
        name: 'Export all notes to PDF',
        callback: async () => {
            let files = plugin.app.vault.getFiles();
            files = files.filter(file => file.extension === "xopp");
            let filePaths = files.map(file => file.path)
            exportXoppToPDF(plugin, filePaths)
        }
    });

    plugin.addCommand({
        id: 'export-current-xournalpp-to-pdf',
        name: 'Update current PDF',
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