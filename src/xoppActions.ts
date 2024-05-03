import { TFile, Notice, App, FileSystemAdapter } from 'obsidian';

export function openXournalppFile(xoppFile: TFile, app: App): void {
    app.workspace.getLeaf().openFile(xoppFile)
    new Notice('Opening file in Xournal++');
}

export async function createXoppFile(plugin) {
    let templatePath  = plugin.app.vault.configDir + "/plugins/" + plugin.manifest.id + "/template.xopp"
    let newNoteName = "test" + ".xopp"
    let newNotePath =  "/" + newNoteName
    const fs = plugin.app.vault.adapter as FileSystemAdapter;

    await fs.copy(templatePath, newNotePath)
}

