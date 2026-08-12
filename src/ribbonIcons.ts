import XoppPlugin from "src/main";
import CreateXoppModalManager from "src/ui/managers/create-xopp-modal-manager";

export function createRibbonIcons(plugin: XoppPlugin) {
    plugin.addRibbonIcon("pen-tool", "Create new Xournal++ note", () => {
        new CreateXoppModalManager(plugin.app, plugin);
    });
}
