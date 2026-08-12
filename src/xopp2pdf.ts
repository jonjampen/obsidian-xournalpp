import { FileSystemAdapter, Notice } from "obsidian";
import { exec } from "child_process";
import XoppPlugin from "src/main";
import { checkXoppSetup } from "./checks";

export function exportXoppToPDF(plugin: XoppPlugin, filePaths: Array<string>, notify = true) {
    let errors = false;

    filePaths.forEach(async (filePath: string) => {
        const fs = plugin.app.vault.adapter;
        if (fs instanceof FileSystemAdapter) {
            const vaultPath = fs.getBasePath();
            const xoppFilePath = vaultPath + "/" + filePath;
            const pdfFilePath = xoppFilePath.replace(".xopp", ".pdf");

            const path = await checkXoppSetup(plugin);
            if (!path || path === "error") {
                new Notice("Error: Xournal++ path not setup correctly. Please check docs on how to set it up.", 10000);
                return;
            }

            const command = `${path} --create-pdf="${pdfFilePath}" "${xoppFilePath}"`;
            exec(command, (error) => {
                if (error) {
                    console.error(`Error converting Xournal++ to PDF: ${error.message}`);
                    errors = true;
                    return;
                }
            });
        }
    });

    if (errors) {
        new Notice("Error converting Xournal++ to PDF. Check the console for more information.");
        return;
    }

    if (notify) new Notice("Exported all Xournal++ notes successfully.");
}

export function exportAllXoppToPDF(plugin: XoppPlugin) {
    let files = plugin.app.vault.getFiles();
    files = files.filter((file) => file.extension === "xopp");
    const filePaths = files.map((file) => file.path);
    exportXoppToPDF(plugin, filePaths);
}
