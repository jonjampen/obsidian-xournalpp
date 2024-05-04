import XoppPlugin from "main";
import { ButtonComponent } from "obsidian";
import { createXoppFileModal } from "./modal";

export function	addCreateXournalppNavIcon(plugin: XoppPlugin) {
    let fileExplorers = plugin.app.workspace.getLeavesOfType("file-explorer")

    fileExplorers.forEach(fileExplorer => {
        let fileExplorerIconsNav = fileExplorer.view.headerDom.navButtonsEl;
        
        if (fileExplorerIconsNav && fileExplorerIconsNav.children.length > 2 && !fileExplorerIconsNav.querySelector('.xournalpp-create-icon')) {
            let createXoppButton = new ButtonComponent(fileExplorerIconsNav as HTMLElement)
                .setClass("clickable-icon")
                .setClass("xournalpp-create-icon")
                .setIcon('pen-tool')
                .setTooltip('Create new Xournal++');
            
            createXoppButton.onClick(() =>  {
                new createXoppFileModal(plugin.app, plugin)
                .setTitle("Create a new Xournal++ note")
                .open()
            })
            
            fileExplorerIconsNav.insertAfter(createXoppButton.buttonEl, fileExplorerIconsNav.children[1]);
        }
    })
}