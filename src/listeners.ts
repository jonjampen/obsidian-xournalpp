import XoppPlugin from "main";
import { addXournalppOptionsToFileMenu } from "./fileMenu";
import { Menu, TFile, TFolder } from "obsidian";
import { addOpenInXournalppToPdfToolbar } from "./pdfToolbar";
import { addCreateXournalppNavIcon } from "./fileExplorerNav";
import { addOpenInXournalpp } from "./fileExplorerFile";
import { exportXoppToPDF } from "./xopp2pdf";

export function setupListeners(plugin: XoppPlugin) {
    initialLoad(plugin);

    // on startup
    plugin.registerEvent(plugin.app.workspace.on("layout-change", () => {
        addCreateXournalppNavIcon(plugin);
        addOpenInXournalpp(plugin);
    }));
    
    plugin.registerEvent(plugin.app.workspace.on("file-open", (file: TFile) => {
        addOpenInXournalppToPdfToolbar(file, plugin);
    }));
    plugin.registerEvent(plugin.app.workspace.on("file-menu", (menu: Menu, file: TFile|TFolder) => {
        addXournalppOptionsToFileMenu(menu, file, plugin);
    }));
    plugin.registerEvent(plugin.app.workspace.on("active-leaf-change", (leaf) => {
        if (leaf?.getDisplayText() === "Files") {
            addCreateXournalppNavIcon(plugin);
            addOpenInXournalpp(plugin);
        }
    }));

    plugin.registerEvent(plugin.app.vault.on("modify", (file: TFile) => {
        if (file.extension === "xopp" && plugin.settings.autoExport) exportXoppToPDF(plugin, [file.path], false)
    }))
    plugin.registerEvent(plugin.app.vault.on("create", (file: TFile) => {
        if (file.extension === "xopp" && plugin.settings.autoExport) exportXoppToPDF(plugin, [file.path], false)
    }))
}

function initialLoad(plugin: XoppPlugin) {
    if (plugin.settings.autoExport) {
        let files = plugin.app.vault.getFiles();
        files = files.filter(file => file.extension === "xopp");
        let filePaths = files.map(file => file.path)
        exportXoppToPDF(plugin, filePaths, false)
    }
    
    addCreateXournalppNavIcon(plugin);
    addOpenInXournalpp(plugin);
}