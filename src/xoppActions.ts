import XoppPlugin from 'main';
import { TFile, Notice, App, DataAdapter, Vault } from 'obsidian';
import { base64Template } from './template';
import { checkXoppSetup } from './checks';
import { exec } from 'child_process';

export async function openXournalppFile(xoppFile: TFile, plugin: XoppPlugin): Promise<void> {
    let path = await checkXoppSetup(plugin);
    if (!path || path === "error") {
        new Notice("Error: Xournal++ path not setup correctly. Please check docs on how to set it up.", 10000);
        return;
    }
    
    let command = `${path} "${xoppFile.path}"`
    new Notice('Opening file in Xournal++');
    exec(command, (error) => {
        if (error) {
            new Notice('Error opening file in Xournal++. Check console for error message.');
            console.error(`Error opening file in Xournal++: ${error.message}`)
            return
        }
    });
}

export async function createXoppFile(plugin: XoppPlugin, newNoteName: string) {
    let newNotePath =  "/" + newNoteName
    const fs = plugin.app.vault.adapter;
    
    try {
        const templatePath = await getTemplateFilePath(plugin, fs);
        await fs.copy(templatePath, newNotePath);
        new Notice("Xournal++ note created")
    }
    catch (e) {
        new Notice("Error: Could not create a Xournal++ note: " + e.message)
    }
    
}

export function findCorrespondingXoppToPdf(pdfFilePath: string, plugin: XoppPlugin): TFile|undefined {
    let xoppFilePath = pdfFilePath?.replace(".pdf", ".xopp");
    let xoppFilename = xoppFilePath.substring(xoppFilePath.lastIndexOf("/") + 1)
    const pdfFile = plugin.app.vault.getFileByPath(pdfFilePath);
    
    // set parent folder or root vault folder
    const parentFolder = pdfFile?.parent ?? plugin.app.vault.getFolderByPath("/");
    const xoppFile = parentFolder?.children.find((child) => child.name === xoppFilename)

    if (xoppFile instanceof TFile) return xoppFile
}

export async function getTemplateFilePath(
    plugin: XoppPlugin,
    fs: DataAdapter
): Promise<string> {
    const userTemplatePath = plugin.settings.templatePath;
    if (userTemplatePath) {
        if (!(await fs.exists(userTemplatePath)))
            throw new Error("Could not find the given template file.");
        return userTemplatePath;
    }

    const DEFAULT_TEMPLATE_PATH =
        plugin.app.vault.configDir +
        "/plugins/" +
        plugin.manifest.id +
        "/template.xopp";

    if (!(await fs.exists(DEFAULT_TEMPLATE_PATH))) {
        await createTemplate(plugin, DEFAULT_TEMPLATE_PATH)
            .catch(() => {throw new Error("Unable to get or create the default template.")});
    }
    
    return DEFAULT_TEMPLATE_PATH;
}

export async function createTemplate(plugin: XoppPlugin, path: string) {
    // base64 to Uint8Array
    let binaryString: string = atob(base64Template);
    let bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    // create file in fs
    await plugin.app.vault.createBinary(path, bytes.buffer);
}
