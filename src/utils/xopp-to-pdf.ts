import { FileSystemAdapter, Notice } from "obsidian";
import { exec } from "child_process";
import XoppPlugin from "src/main";
import { checkXoppSetup } from "../core/environment-checks";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function exportXoppToPDF(plugin: XoppPlugin, filePaths: Array<string>, notify = true): Promise<void> {
    const fs = plugin.app.vault.adapter;
    if (!(fs instanceof FileSystemAdapter)) {
        return;
    }

    const path = await checkXoppSetup(plugin);
    if (!path || path === "error") {
        new Notice("Error: Xournal++ path not setup correctly. Please check docs on how to set it up.", 10000);
        return;
    }

    const vaultPath = fs.getBasePath();
    let hasErrors = false;

    // Process paths in batches of 5 to prevent system process exhaustion
    const concurrencyLimit = 5;
    for (let i = 0; i < filePaths.length; i += concurrencyLimit) {
        const batch = filePaths.slice(i, i + concurrencyLimit);
        const batchPromises = batch.map(async (filePath) => {
            const xoppFilePath = vaultPath + "/" + filePath;
            const pdfFilePath = xoppFilePath.replace(".xopp", ".pdf");
            const command = `${path} --create-pdf="${pdfFilePath}" "${xoppFilePath}"`;

            try {
                await execPromise(command);
            } catch (error) {
                console.error(`Error converting Xournal++ to PDF (${filePath}):`, error);
                hasErrors = true;
            }
        });
        await Promise.all(batchPromises);
    }

    if (hasErrors) {
        new Notice("Error converting some Xournal++ files to PDF. Check the console for details.");
    } else if (notify) {
        new Notice("Exported all Xournal++ notes successfully.");
    }
}

export async function exportAllXoppToPDF(plugin: XoppPlugin): Promise<void> {
    let files = plugin.app.vault.getFiles();
    files = files.filter((file) => file.extension === "xopp");
    const filePaths = files.map((file) => file.path);
    await exportXoppToPDF(plugin, filePaths);
}
