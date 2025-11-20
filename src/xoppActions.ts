import XoppPlugin from "main";
import { TFile, Notice, DataAdapter, FileSystemAdapter } from "obsidian";
import { base64Template } from "./template";
import { checkXoppSetup } from "./checks";
import { exec } from "child_process";

export async function openXournalppFile(xoppFile: TFile, plugin: XoppPlugin): Promise<void> {
    const path = await checkXoppSetup(plugin);

    const fs = plugin.app.vault.adapter;
    if (fs instanceof FileSystemAdapter) {
        const vaultPath = fs.getBasePath();

        if (!path || path === "error") {
            new Notice("Error: Xournal++ path not setup correctly. Please check docs on how to set it up.", 10000);
            return;
        }

        const command = `${path} "${vaultPath + "/" + xoppFile.path}"`;
        new Notice("Opening file in Xournal++");
        exec(command, (error) => {
            if (error) {
                new Notice("Error opening file in Xournal++. Check console for error message.");
                console.error(`Error opening file in Xournal++: ${error.message}`);
                return;
            }
        });
    } else {
        new Notice("Error opening file in Xournal++. Check console for error message.");
    }
}

export async function createXoppFile(plugin: XoppPlugin, newNoteName: string, selectedTemplatePath?: string) {
    const newNotePath = newNoteName.startsWith("/") ? newNoteName.slice(1) : newNoteName;

    const fs = plugin.app.vault.adapter;

    try {
        const templatePath = selectedTemplatePath || (await getTemplateFilePath(plugin, fs));
        await fs.copy(templatePath, newNotePath);
        new Notice("Xournal++ note created");
    } catch (e) {
        new Notice("Error: Could not create a Xournal++ note: " + e.message);
    }
}

export function findCorrespondingXoppToPdf(pdfFilePath: string, plugin: XoppPlugin): TFile | undefined {
    const xoppFilePath = pdfFilePath?.replace(".pdf", ".xopp");
    const xoppFilename = xoppFilePath.substring(xoppFilePath.lastIndexOf("/") + 1);
    const pdfFile = plugin.app.vault.getFileByPath(pdfFilePath);

    // set parent folder or root vault folder
    const parentFolder = pdfFile?.parent ?? plugin.app.vault.getFolderByPath("/");
    const xoppFile = parentFolder?.children.find((child) => child.name === xoppFilename);

    if (xoppFile instanceof TFile) return xoppFile;
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

export function renameXoppFile(plugin: XoppPlugin, xoppFile: TFile, pdfFile: TFile, fileName: string) {
    const filePath = xoppFile.path.split("/");
    filePath.pop();
    const newPath = filePath?.join("/") + "/" + fileName;
    plugin.app.fileManager.renameFile(xoppFile, newPath + ".xopp");
    plugin.app.fileManager.renameFile(pdfFile, newPath + ".pdf");
}

export function deleteXoppAndPdf(plugin: XoppPlugin, xoppFile: TFile, pdfFile: TFile) {
    plugin.app.vault.delete(xoppFile);
    plugin.app.vault.delete(pdfFile);
}
