import { TFile, Plugin, Notice, ButtonComponent } from 'obsidian';
import { createCommands } from 'src/commands';
import { setupListeners } from 'src/listeners';
import { createXoppFileModal } from 'src/modal';
import { createPdfToolbarButton } from 'src/pdfToolbarButton';
import { createRibbonIcons } from 'src/ribbonIcons';

export default class XoppPlugin extends Plugin {
    onload() {
		setupListeners(this);
		createCommands(this);
		createRibbonIcons(this);
    }

	onFileOpen = async (file: TFile) => {
		if (file && file instanceof TFile && file.extension === "pdf") {
			// check if related xopp file exists
			let filename = file?.name;
			let xoppFilename = filename?.replace(".pdf", ".xopp");

			// set parent folder or root vault folder
			const parentFolder = file?.parent ?? this.app.vault.getFolderByPath("/");
			const xoppFile = parentFolder?.children.find((child) => child.name === xoppFilename) as TFile

			// reset icon
			const oldIcons = document.querySelectorAll('.xournalpp-open-icon');
			oldIcons.forEach((old) => old.remove())

			if (xoppFile) {
				// show toolbar icon
				const pdfToolbar = document.querySelector('.pdf-toolbar-right') as HTMLElement;

				if (pdfToolbar) {
					createPdfToolbarButton(pdfToolbar, xoppFile, this.app)
				}
			}
		}
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
