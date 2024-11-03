import XoppPlugin from "main";
import { ButtonComponent } from "obsidian";
import CreateXoppModalManager from "./CreateXoppModalManager";

export function addCreateXournalppNavIcon(plugin: XoppPlugin) {
    let fileExplorers = plugin.app.workspace.getLeavesOfType("file-explorer");

    fileExplorers.forEach((fileExplorer) => {
        let fileExplorerIconsNav = (fileExplorer.view as any)?.headerDom.navButtonsEl;

        if (
            fileExplorerIconsNav &&
            fileExplorerIconsNav.children.length > 2 &&
            !fileExplorerIconsNav.querySelector(".xournalpp-create-icon")
        ) {
            let createXoppButton = new ButtonComponent(fileExplorerIconsNav as HTMLElement)
                .setClass("clickable-icon")
                .setClass("xournalpp-create-icon")
                .setIcon("pen-tool")
                .setTooltip("Create new Xournal++");

            createXoppButton.onClick(() => {
                new CreateXoppModalManager(plugin.app, plugin);
            });

            fileExplorerIconsNav.insertAfter(createXoppButton.buttonEl, fileExplorerIconsNav.children[1]);
        }
    });
}
