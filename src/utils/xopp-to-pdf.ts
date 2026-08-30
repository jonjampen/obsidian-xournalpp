import { FileSystemAdapter, Notice } from "obsidian";
import { exec } from "child_process";
import { rename, unlink } from "fs/promises";
import XoppPlugin from "src/main";
import { checkXoppSetup } from "../core/environment-checks";
import { promisify } from "util";

const execPromise = promisify(exec);

const activeExports = new Set<string>();
const pendingExports = new Set<string>();

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

    const pathsToProcess: string[] = [];
    for (const fp of filePaths) {
        if (activeExports.has(fp)) {
            pendingExports.add(fp);
        } else {
            activeExports.add(fp);
            pathsToProcess.push(fp);
        }
    }

    if (pathsToProcess.length === 0) {
        return;
    }

    // Process paths in batches of 5 to prevent system process exhaustion
    const concurrencyLimit = 5;
    for (let i = 0; i < pathsToProcess.length; i += concurrencyLimit) {
        const batch = pathsToProcess.slice(i, i + concurrencyLimit);
        const batchPromises = batch.map(async (filePath) => {
            const xoppFilePath = vaultPath + "/" + filePath;
            const pdfFilePath = xoppFilePath.replace(/\.xopp$/i, ".pdf");
            const tempPdfFilePath = `${pdfFilePath}.tmp`;
            const command = `${path} --create-pdf="${tempPdfFilePath}" "${xoppFilePath}"`;

            const maxRetries = 3;
            let success = false;
            let lastError: unknown;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    await execPromise(command);
                    await rename(tempPdfFilePath, pdfFilePath).catch(() => {});
                    success = true;
                    break;
                } catch (error) {
                    lastError = error;
                    await unlink(tempPdfFilePath).catch(() => {});
                    if (attempt < maxRetries) {
                        await new Promise((resolve) => window.setTimeout(resolve, 500));
                    }
                }
            }

            if (!success) {
                console.error(`Error converting Xournal++ to PDF (${filePath}):`, lastError);
                hasErrors = true;
            }

            activeExports.delete(filePath);

            if (pendingExports.has(filePath)) {
                pendingExports.delete(filePath);
                void exportXoppToPDF(plugin, [filePath], false);
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
