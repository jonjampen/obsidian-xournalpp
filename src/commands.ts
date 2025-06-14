import { Editor, TFile } from "obsidian";
import { deleteXoppAndPdf, findCorrespondingXoppToPdf, openXournalppFile, renameXoppFile } from "./xoppActions";
import XoppPlugin from "main";
import { exportAllXoppToPDF, exportXoppToPDF } from "./xopp2pdf";
import CreateXoppModalManager from "./CreateXoppModalManager";
import RenameModal from "./modals/RenameModal";
import SearchXoppModal from "./modals/SearchXoppModal";

export function createCommands(plugin: XoppPlugin) {
    plugin.addCommand({
        id: "open-in-xournalpp",
        name: "Open current note",
        checkCallback: (checking: boolean) => {
            let pdfFilePath = plugin.app.workspace.getActiveFile()?.path;
            if (!pdfFilePath || plugin.app.workspace.getActiveFile()?.extension !== "pdf") return false;

            let xoppFile = findCorrespondingXoppToPdf(pdfFilePath, plugin);
            if (!xoppFile) return false;

            if (!checking) openXournalppFile(xoppFile, plugin);
            return true;
        },
    });

    plugin.addCommand({
        id: "crate-new-xournalpp",
        name: "Create a new note",
        callback: async () => {
            new CreateXoppModalManager(plugin.app, plugin, "");
        },
    });

    plugin.addCommand({
        id: "crate-new-xournalpp-and-link-xopp",
        name: "Create a new note and insert XOPP link",
        editorCallback: async (editor: Editor) => {
            new CreateXoppModalManager(plugin.app, plugin, "", editor, "XOPP");
        },
    });

    plugin.addCommand({
        id: "crate-new-xournalpp-and-link-pdf",
        name: "Create a new note and insert PDF link",
        editorCallback: async (editor: Editor) => {
            new CreateXoppModalManager(plugin.app, plugin, "", editor, "PDF");
        },
    });

    plugin.addCommand({
        id: "crate-new-xournalpp-and-link-embedded-pdf",
        name: "Create a new note and insert embedded PDF link",
        editorCallback: async (editor: Editor) => {
            new CreateXoppModalManager(plugin.app, plugin, "", editor, "embeddedPDF");
        },
    });

    plugin.addCommand({
        id: "crate-new-xournalpp-and-link-xopp-pdf",
        name: "Create a new note and insert PDF and XOPP link",
        editorCallback: async (editor: Editor) => {
            new CreateXoppModalManager(plugin.app, plugin, "", editor);
        },
    });

    plugin.addCommand({
        id: "export-xournalpp-to-pdf",
        name: "Export all notes to PDF",
        callback: async () => {
            exportAllXoppToPDF(plugin);
        },
    });

    plugin.addCommand({
        id: "export-current-xournalpp-to-pdf",
        name: "Update current PDF",
        checkCallback: (checking: boolean) => {
            let filePath = plugin.app.workspace.getActiveFile()?.path as string;

            if (filePath && filePath.includes(".pdf")) {
                if (!checking) {
                    filePath = filePath?.replace(".pdf", ".xopp");
                    exportXoppToPDF(plugin, [filePath]);
                }
                return true;
            }
            return false;
        },
    });

    plugin.addCommand({
        id: "rename-xournalpp",
        name: "Rename current PDF and corresponding Xournal++ note",
        checkCallback: (checking: boolean) => {
            let pdfFile = plugin.app.workspace.getActiveFile();
            if (!pdfFile || !pdfFile.name.endsWith(".pdf")) return false;

            let xoppFile = findCorrespondingXoppToPdf(pdfFile.path, plugin);
            if (!xoppFile) return false;

            if (!checking) {
                const renameFile = (fileName: string) =>
                    renameXoppFile(plugin, xoppFile as TFile, pdfFile as TFile, fileName);
                new RenameModal(plugin.app, xoppFile.path, renameFile).open();
            }
            return true;
        },
    });

    plugin.addCommand({
        id: "delete-xournalpp",
        name: "Delete current PDF and corresponding Xournal++ note",
        checkCallback: (checking: boolean) => {
            let pdfFile = plugin.app.workspace.getActiveFile();
            if (!pdfFile || !pdfFile.name.endsWith(".pdf")) return false;

            let xoppFile = findCorrespondingXoppToPdf(pdfFile.path, plugin);
            if (!xoppFile) return false;

            if (!checking) {
                deleteXoppAndPdf(plugin, xoppFile, pdfFile);
            }
            return true;
        },
    });

    plugin.addCommand({
        id: "xournalpp-search-and-open",
        name: "Search and open Xournal++ note",
        callback: () => {
            const searchModal = new SearchXoppModal(plugin.app, plugin);
            searchModal.setPlaceholder("Search for a Xournal++ note");
            searchModal.setInstructions([
                { command: "Arrows", purpose: "to navigate" },
                { command: "Tab", purpose: "to autocomplete" },
                { command: "Enter", purpose: "to open the corresponding PDF" },
                { command: "Shift + Enter", purpose: "to open in Xournal++" },
            ]);
            searchModal.open();
        },
    });
}
