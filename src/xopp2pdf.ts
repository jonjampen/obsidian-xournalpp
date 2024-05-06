import { FileSystemAdapter, Notice, TFile } from "obsidian"
import { exec } from 'child_process';
import XoppPlugin from "main";
import { checkXoppSetup } from "./checks";

export function exportXoppToPDF(plugin: XoppPlugin, files: TFile[]) {
    let errors = false;

    files.forEach(async (file) => {
        let vaultPath = (plugin.app.vault.adapter as FileSystemAdapter).getBasePath();
        let xoppFilePath = vaultPath + "/" + file.path;
        let pdfFilePath = xoppFilePath.replace(".xopp", ".pdf");

        let path = await checkXoppSetup();
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

    new Notice("Exported all Xournal++ notes successfully.")
}