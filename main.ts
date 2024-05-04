import { Plugin, ButtonComponent } from 'obsidian';
import { createCommands } from 'src/commands';
import { setupListeners } from 'src/listeners';
import { createXoppFileModal } from 'src/modal';
import { createRibbonIcons } from 'src/ribbonIcons';

export default class XoppPlugin extends Plugin {
    onload() {
		setupListeners(this);
		createCommands(this);
		createRibbonIcons(this);
    }

	addCreateXournalppNavIcon = () => {
		let fileExplorers = this.app.workspace.getLeavesOfType("file-explorer")

		fileExplorers.forEach(fileExplorer => {
			let fileExplorerIconsNav = fileExplorer.view.headerDom.navButtonsEl;
			
			if (fileExplorerIconsNav && fileExplorerIconsNav.children.length > 2 && !fileExplorerIconsNav.querySelector('.xournalpp-create-icon')) {
				let createXoppButton = new ButtonComponent(fileExplorerIconsNav as HTMLElement)
					.setClass("clickable-icon")
					.setClass("xournalpp-create-icon")
					.setIcon('pen-tool')
					.setTooltip('Create new Xournal++');
				
				createXoppButton.onClick(() =>  {
					new createXoppFileModal(this.app, this)
					.setTitle("Create a new Xournal++ note")
					.open()
				})
				
				fileExplorerIconsNav.insertAfter(createXoppButton.buttonEl, fileExplorerIconsNav.children[1]);
			}
		})
	}

    onunload() {}
}
