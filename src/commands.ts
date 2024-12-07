import { Editor } from "obsidian";
import { deleteXoppAndPdf, findCorrespondingXoppToPdf, openXournalppFile, renameXoppFile } from "./xoppActions";
import XoppPlugin from "main";
import { exportXoppToPDF } from "./xopp2pdf";
import CreateXoppModalManager from "./CreateXoppModalManager";
import RenameModal from "./modals/RenameModal";

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
            let files = plugin.app.vault.getFiles();
            files = files.filter((file) => file.extension === "xopp");
            let filePaths = files.map((file) => file.path);
            exportXoppToPDF(plugin, filePaths);
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
                const renameFile = (fileName: string) => renameXoppFile(plugin, xoppFile, pdfFile, fileName);
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
}
