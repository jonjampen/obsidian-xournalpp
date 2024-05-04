import XoppPlugin from "main";

export function setupListeners(plugin: XoppPlugin) {
    // on startup
    plugin.registerEvent(plugin.app.workspace.on("layout-change", () => {
        plugin.addCreateXournalppNavIcon();
    }));

    plugin.registerEvent(plugin.app.workspace.on("file-open", plugin.onFileOpen));
    plugin.registerEvent(plugin.app.workspace.on("file-menu", plugin.onFileMenuOpen));
    plugin.registerEvent(plugin.app.workspace.on("active-leaf-change", (leaf) => {
        if (leaf?.getDisplayText() === "Files") plugin.addCreateXournalppNavIcon();
    }));
}