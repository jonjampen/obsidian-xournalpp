import XoppPlugin from "main";
import { ButtonComponent } from "obsidian";
import CreateXoppModalManager from "./CreateXoppModalManager";

export function addCreateXournalppNavIcon(plugin: XoppPlugin) {
    let fileExplorers = plugin.app.workspace.getLeavesOfType("file-explorer");

    fileExplorers.forEach((fileExplorer) => {
        const fileExplorerView = fileExplorer.view as any;
        const headerDom = fileExplorerView?.headerDom;
        const navButtonsEl = headerDom?.navButtonsEl;

        if (navButtonsEl && navButtonsEl.children.length > 2 && !navButtonsEl.querySelector(".xournalpp-create-icon")) {
            let createXoppButton = new ButtonComponent(navButtonsEl as HTMLElement)
                .setClass("clickable-icon")
                .setClass("xournalpp-create-icon")
                .setIcon("pen-tool")
                .setTooltip("Create new Xournal++");

            createXoppButton.onClick(() => {
                new CreateXoppModalManager(plugin.app, plugin);
            });

            navButtonsEl.insertAfter(createXoppButton.buttonEl, navButtonsEl.children[1]);
        }
    });
}
