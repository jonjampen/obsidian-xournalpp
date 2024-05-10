import { FileSystemAdapter, Notice, TFile } from "obsidian"
import { exec } from 'child_process';
import XoppPlugin from "main";
import { checkXoppSetup } from "./checks";

export function exportXoppToPDF(plugin: XoppPlugin, filePaths: Array<string>, notify: boolean = true) {
    let errors = false;

    filePaths.forEach(async (filePath: string) => {
        let vaultPath = (plugin.app.vault.adapter as FileSystemAdapter).getBasePath();
        let xoppFilePath = vaultPath + "/" + filePath;
        let pdfFilePath = xoppFilePath.replace(".xopp", ".pdf");

        let path = await checkXoppSetup(plugin);
        if (!path || path === "error") {
            new Notice("Error: Xournal++ path not setup correctly. Please check docs on how to set it up.", 10000);
            return;
        }

        let command = `${path} --create-pdf=${pdfFilePath} ${xoppFilePath}`
        exec(command, (error) => {
            if (error) {
                console.error(`Error converting Xournal++ to PDF: ${error.message}`)
                errors = true;
                return;
            }
        });
    })
    
    if (errors) {
        new Notice("Error converting Xournal++ to PDF. Check the console for more information.");
        return
    }

    if (notify) new Notice("Exported all Xournal++ notes successfully.")
}