import XoppPlugin from "main";
import { addXournalppOptionsToFileMenu } from "./fileMenu";
import { Menu, TFile, TFolder } from "obsidian";
import { addOpenInXournalppToPdfToolbar } from "./pdfToolbar";
import { addCreateXournalppNavIcon } from "./fileExplorerNav";
import { addOpenInXournalpp } from "./fileExplorerFile";

export function setupListeners(plugin: XoppPlugin) {
    // on startup
    plugin.registerEvent(plugin.app.workspace.on("layout-change", () => {
        console.log("layout changed")
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
}