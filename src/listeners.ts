import XoppPlugin from "main";
import { addXournalppOptionsToFileMenu } from "./fileMenu";
import { Menu, TFile, TFolder } from "obsidian";

export function setupListeners(plugin: XoppPlugin) {
    // on startup
    plugin.registerEvent(plugin.app.workspace.on("layout-change", () => {
        plugin.addCreateXournalppNavIcon();
    }));

    plugin.registerEvent(plugin.app.workspace.on("file-open", plugin.onFileOpen));
    plugin.registerEvent(plugin.app.workspace.on("file-menu", (menu: Menu, file: TFile) => {
        addXournalppOptionsToFileMenu(menu, file, plugin);
    }));
    plugin.registerEvent(plugin.app.workspace.on("active-leaf-change", (leaf) => {
        if (leaf?.getDisplayText() === "Files") plugin.addCreateXournalppNavIcon();
    }));
}