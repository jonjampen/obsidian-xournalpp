import XoppPlugin from 'main';
import { TFile, Notice, App } from 'obsidian';

export function openXournalppFile(xoppFile: TFile, app: App): void {
    app.workspace.getLeaf().openFile(xoppFile)
    new Notice('Opening file in Xournal++');
}

export async function createXoppFile(plugin: XoppPlugin, newNoteName: string) {
    let templatePath  = plugin.app.vault.configDir + "/plugins/" + plugin.manifest.id + "/template.xopp"
    let newNotePath =  "/" + newNoteName
    const fs = plugin.app.vault.adapter;
    
    try {
        await fs.copy(templatePath, newNotePath)
        new Notice("Xournal++ note created")
    }
    catch {
        new Notice("Error: Could not create a Xournal++ note")
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