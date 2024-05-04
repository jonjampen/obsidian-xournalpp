import XoppPlugin from "main";
import { createXoppFileModal } from "./modal";

export function createRibbonIcons(plugin: XoppPlugin) {
    plugin.addRibbonIcon('pen-tool', 'Create new Xournal++ note', (evt: MouseEvent) => {
        new createXoppFileModal(plugin.app, plugin)
            .setTitle("Create a new Xournal++ note")
            .open();
    });
}