import XoppPlugin from "main";
import { ButtonComponent } from "obsidian";
import CreateXoppModalManager from "./CreateXoppModalManager";

interface FileExplorerViewHeader {
    headerDom?: {
        navButtonsEl?: HTMLElement;
    };
}

export function addCreateXournalppNavIcon(plugin: XoppPlugin) {
    const fileExplorers = plugin.app.workspace.getLeavesOfType("file-explorer");

    fileExplorers.forEach((fileExplorer) => {
        const fileExplorerView = fileExplorer.view as unknown as FileExplorerViewHeader;
        const headerDom = fileExplorerView?.headerDom;
        const navButtonsEl = headerDom?.navButtonsEl;

        if (navButtonsEl && navButtonsEl.children.length > 2 && !navButtonsEl.querySelector(".xournalpp-create-icon")) {
            const createXoppButton = new ButtonComponent(navButtonsEl as HTMLElement)
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
