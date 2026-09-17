import XoppPlugin from "src/main";
import { TFile, Notice, DataAdapter, FileSystemAdapter } from "obsidian";
import { base64Template } from "../core/default-template";
import { checkXoppSetup } from "../core/environment-checks";
import { spawnXournalpp, runXournalpp } from "./xournalpp-process";
import { join } from "path";

const ANNOTATED_SUFFIX = "-annotated";
const LEGACY_ANNOTATED_SUFFIX = "-批注";
const annotationCreationsInFlight = new Set<string>();

export async function openXournalppFile(xoppFile: TFile, plugin: XoppPlugin): Promise<void> {
    const path = await checkXoppSetup(plugin);

    const fs = plugin.app.vault.adapter;
    if (fs instanceof FileSystemAdapter) {
        const vaultPath = fs.getBasePath();

        if (!path || path === "error") {
            new Notice("Error: Xournal++ path not setup correctly. Please check docs on how to set it up.", 10000);
            return;
        }

        const xoppAbsolutePath = join(vaultPath, ...xoppFile.path.split("/"));
        new Notice("Opening file in Xournal++");
        try {
            const child = spawnXournalpp(path, [xoppAbsolutePath]);
            const reportOpenError = (error: unknown) => {
                const message = error instanceof Error ? error.message : String(error);
                new Notice("Error opening file in Xournal++. Check console for error message.");
                console.error(`Error opening file in Xournal++: ${message}`);
            };
            child.once("error", reportOpenError);
            child.once("close", (code) => {
                if (code !== 0) reportOpenError(new Error(`Xournal++ exited with code ${code ?? "unknown"}.`));
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            new Notice("Error opening file in Xournal++. Check console for error message.");
            console.error(`Error opening file in Xournal++: ${message}`);
        }
    } else {
        new Notice("Error opening file in Xournal++. Check console for error message.");
    }
}

export function getAnnotatedXoppPath(pdfFilePath: string): string {
    return pdfFilePath.replace(/\.pdf$/i, `${ANNOTATED_SUFFIX}.xopp`);
}

export function getAnnotatedPdfPath(pdfFilePath: string): string {
    return pdfFilePath.replace(/\.pdf$/i, `${ANNOTATED_SUFFIX}.pdf`);
}

function getLegacyAnnotatedXoppPath(pdfFilePath: string): string {
    return pdfFilePath.replace(/\.pdf$/i, `${LEGACY_ANNOTATED_SUFFIX}.xopp`);
}

function getLegacyAnnotatedPdfPath(pdfFilePath: string): string {
    return pdfFilePath.replace(/\.pdf$/i, `${LEGACY_ANNOTATED_SUFFIX}.pdf`);
}

export function isAnnotatedXoppForPdf(pdfFilePath: string, xoppFilePath: string): boolean {
    return [getAnnotatedXoppPath(pdfFilePath), getLegacyAnnotatedXoppPath(pdfFilePath)].includes(xoppFilePath);
}

export async function createXoppFile(plugin: XoppPlugin, newNoteName: string, selectedTemplatePath?: string) {
    const newNotePath = newNoteName.startsWith("/") ? newNoteName.slice(1) : newNoteName;

    const fs = plugin.app.vault.adapter;

    try {
        const templatePath = selectedTemplatePath || (await getTemplateFilePath(plugin, fs));
        await fs.copy(templatePath, newNotePath);
        new Notice("Xournal++ note created");
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        new Notice("Error: Could not create a Xournal++ note: " + message);
    }
}

export async function createAnnotatedXoppFromPdf(pdfFile: TFile, plugin: XoppPlugin): Promise<void> {
    const annotationXoppPath = getAnnotatedXoppPath(pdfFile.path);
    const existingJournal = findCorrespondingXoppToPdf(pdfFile.path, plugin);
    if (existingJournal) {
        new Notice("An Xournal++ journal already exists for this PDF.");
        return;
    }

    if (
        plugin.app.vault.getFileByPath(annotationXoppPath) instanceof TFile ||
        plugin.app.vault.getFileByPath(getLegacyAnnotatedXoppPath(pdfFile.path)) instanceof TFile
    ) {
        new Notice("An Xournal++ annotation journal already exists for this PDF.");
        return;
    }

    if (
        plugin.app.vault.getFileByPath(getAnnotatedPdfPath(pdfFile.path)) instanceof TFile ||
        plugin.app.vault.getFileByPath(getLegacyAnnotatedPdfPath(pdfFile.path)) instanceof TFile
    ) {
        new Notice("An annotated PDF already exists for this PDF.");
        return;
    }

    const fs = plugin.app.vault.adapter;
    if (!(fs instanceof FileSystemAdapter)) {
        new Notice("Xournal++ annotation creation is only available on desktop.");
        return;
    }

    if (
        (await fs.exists(annotationXoppPath)) ||
        (await fs.exists(getLegacyAnnotatedXoppPath(pdfFile.path))) ||
        (await fs.exists(getAnnotatedPdfPath(pdfFile.path))) ||
        (await fs.exists(getLegacyAnnotatedPdfPath(pdfFile.path)))
    ) {
        new Notice("An Xournal++ annotation output already exists for this PDF.");
        return;
    }

    if (annotationCreationsInFlight.has(pdfFile.path)) {
        new Notice("Xournal++ annotation creation is already in progress for this PDF.");
        return;
    }

    annotationCreationsInFlight.add(pdfFile.path);

    try {
        const path = await checkXoppSetup(plugin);
        if (!path || path === "error") return;

        const vaultPath = fs.getBasePath();
        const pdfAbsolutePath = join(vaultPath, ...pdfFile.path.split("/"));
        const xoppAbsolutePath = join(vaultPath, ...annotationXoppPath.split("/"));

        try {
            await runXournalpp(path, ["--attach-mode", `--save=${xoppAbsolutePath}`, pdfAbsolutePath]);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`Error creating Xournal++ annotation journal: ${message}`);
            new Notice("Error creating Xournal++ annotation journal. Check console for details.");
            return;
        }

        const annotationFile = await waitForFileToBeIndexed(plugin, annotationXoppPath);
        if (!annotationFile) {
            new Notice("Xournal++ annotation journal was created but could not be indexed by Obsidian.");
            return;
        }

        await openXournalppFile(annotationFile, plugin);
    } finally {
        annotationCreationsInFlight.delete(pdfFile.path);
    }
}

export function findCorrespondingXoppToPdf(pdfFilePath: string, plugin: XoppPlugin): TFile | undefined {
    const xoppFilePath = pdfFilePath?.replace(/\.pdf$/i, ".xopp");
    const xoppFilename = xoppFilePath.substring(xoppFilePath.lastIndexOf("/") + 1);
    const pdfFile = plugin.app.vault.getFileByPath(pdfFilePath);

    // set parent folder or root vault folder
    const parentFolder = pdfFile?.parent ?? plugin.app.vault.getFolderByPath("/");
    const xoppFile = parentFolder?.children.find((child) => child.name === xoppFilename);
    if (xoppFile instanceof TFile) return xoppFile;

    const annotationXoppFilenames = [getAnnotatedXoppPath(pdfFilePath), getLegacyAnnotatedXoppPath(pdfFilePath)].map(
        (path) => path.substring(path.lastIndexOf("/") + 1)
    );
    const annotationXoppFile = parentFolder?.children.find((child) => annotationXoppFilenames.includes(child.name));
    if (annotationXoppFile instanceof TFile) return annotationXoppFile;
}

async function waitForFileToBeIndexed(plugin: XoppPlugin, path: string, timeout = 5000): Promise<TFile | null> {
    const interval = 100;
    const maxAttempts = timeout / interval;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const file = plugin.app.vault.getFileByPath(path);
        if (file instanceof TFile) return file;
        await new Promise((resolve) => window.setTimeout(resolve, interval));
    }
    return null;
}

export async function getTemplateFilePath(plugin: XoppPlugin, fs: DataAdapter): Promise<string> {
    const userTemplatePath = plugin.settings.defaultTemplatePath;
    if (userTemplatePath) {
        if (!(await fs.exists(userTemplatePath))) throw new Error("Could not find the given template file.");
        return userTemplatePath;
    }

    const DEFAULT_TEMPLATE_PATH = plugin.app.vault.configDir + "/plugins/" + plugin.manifest.id + "/template.xopp";

    if (!(await fs.exists(DEFAULT_TEMPLATE_PATH))) {
        await createTemplate(plugin, DEFAULT_TEMPLATE_PATH).catch(() => {
            throw new Error("Unable to get or create the default template.");
        });
    }

    return DEFAULT_TEMPLATE_PATH;
}

export async function createTemplate(plugin: XoppPlugin, path: string) {
    // base64 to Uint8Array
    const binaryString: string = atob(base64Template);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    // create file in fs
    await plugin.app.vault.createBinary(path, bytes.buffer);
}

export async function renameXoppFile(plugin: XoppPlugin, xoppFile: TFile, pdfFile: TFile, fileName: string) {
    const filePath = xoppFile.path.split("/");
    filePath.pop();
    const newPath = filePath?.join("/") + "/" + fileName;
    await plugin.app.fileManager.renameFile(xoppFile, newPath + ".xopp");
    await plugin.app.fileManager.renameFile(pdfFile, newPath + ".pdf");
}

export async function deleteXoppAndPdf(plugin: XoppPlugin, xoppFile: TFile, pdfFile: TFile) {
    await plugin.app.fileManager.trashFile(xoppFile);
    await plugin.app.fileManager.trashFile(pdfFile);
}
