import { TFile, Plugin, Notice, ButtonComponent } from 'obsidian';
import { createCommands } from 'src/commands';
import { setupListeners } from 'src/listeners';
import { createXoppFileModal } from 'src/modal';
import { createPdfToolbarButton } from 'src/pdfToolbarButton';
import { createRibbonIcons } from 'src/ribbonIcons';
import { annotatePdfInXournalpp, openXournalppFile } from 'src/xoppActions';

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

	findCorrespondingXoppToPdf = (pdfFilePath: string): TFile => {
		let xoppFilePath = pdfFilePath?.replace(".pdf", ".xopp");
		let xoppFilename = xoppFilePath.substring(xoppFilePath.lastIndexOf("/") + 1)
		const pdfFile = this.app.vault.getFileByPath(pdfFilePath);
		
		// set parent folder or root vault folder
		const parentFolder = pdfFile?.parent ?? this.app.vault.getFolderByPath("/");
		const xoppFile = parentFolder?.children.find((child) => child.name === xoppFilename) as TFile

		return xoppFile
	}


	onFileMenuOpen = (menu, file: TFile) => {
		if (file.extension === "xopp") {
			this.addOpenInXournalppMenu(menu, file)
		}
		else if (file.extension === "pdf") {
			let xoppFile = this.findCorrespondingXoppToPdf(file.path)
			if (xoppFile) {
				this.addOpenInXournalppMenu(menu, xoppFile)
			}
		}
		else if (file?.children) {
			// folder
			this.addACreateXournalppMenu(menu, file)
		}
	}
	
	addOpenInXournalppMenu = (menu, xoppFile: TFile) => {
		menu.addItem(item => {
			item.setTitle('Open in Xournal++')
				.setIcon('pen-tool')
				.onClick(() => {
					openXournalppFile(xoppFile, this.app)
				});
		});
	}

	addACreateXournalppMenu = (menu, folder: TFile) => {
		menu.addItem(item => {
			item.setTitle('Create new Xournal++')
				.setIcon('pen-tool')
				.onClick(() => {
					new createXoppFileModal(this.app, this, folder?.path ?? "")
						.setTitle("Create a new Xournal++ note")
						.open()
				});
		});
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
