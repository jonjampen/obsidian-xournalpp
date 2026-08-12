import XoppPlugin from "main";
import CreateXoppModalManager from "./CreateXoppModalManager";

export function createRibbonIcons(plugin: XoppPlugin) {
    plugin.addRibbonIcon("pen-tool", "Create new Xournal++ note", () => {
        new CreateXoppModalManager(plugin.app, plugin);
    });
}
