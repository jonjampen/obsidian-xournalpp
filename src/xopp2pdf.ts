import { FileSystemAdapter, Notice, TFile } from "obsidian"
import { exec } from 'child_process';
import XoppPlugin from "main";

export function exportXoppToPDF(plugin: XoppPlugin) {
    let errors;
    let files = plugin.app.vault.getFiles() as TFile[]
    files = files.filter(file => file.extension === "xopp")

    files.forEach(file => {
        let vaultPath = (plugin.app.vault.adapter as FileSystemAdapter).getBasePath()
        let xoppFilePath = vaultPath + "/" + file.path
        let pdfFilePath = xoppFilePath.replace(".xopp", ".pdf")

        let command = `xournalpp --create-pdf=${pdfFilePath} ${xoppFilePath}`
        exec(command, (error) => {
            if (error) {
                console.log(`Error converting Xournal++ to PDF: ${error.message}`)
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