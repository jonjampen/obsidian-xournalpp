import { TFile, Plugin, Notice } from 'obsidian';
import { createXoppFileModal } from 'src/modal';
import { createPdfToolbarButton } from 'src/pdfToolbarButton';
import { annotatePdfInXournalpp, openXournalppFile } from 'src/xoppActions';

export default class XoppPlugin extends Plugin {
    onload() {
		// on pdf file open
        this.registerEvent(this.app.workspace.on('file-open', this.onFileOpen));
        this.registerEvent(this.app.workspace.on('file-menu', this.onFileMenuOpen))

		this.addCommand({
            id: 'xournalpp:open-in-xournalpp',
            name: 'Open current file in Xournal++',
            callback: () => {
				let pdfFilePath = this.app.workspace.getActiveFile()?.path
				
				if (!pdfFilePath || this.app.workspace.getActiveFile()?.extension !== "pdf") {
					new Notice("Error: This file does not have a corresponding .xopp file.")
					return
				}

				let xoppFile = this.findCorrespondingXoppToPdf(pdfFilePath)
				
				if (!xoppFile) {
					new Notice("Error: This file does not have a corresponding .xopp file.")
					return;
				}

                openXournalppFile(xoppFile, this.app);
            }
        });
		
		this.addCommand({
            id: 'xournalpp:crate-new-xournalpp',
            name: 'Create a new Xournal++ note',
            callback: async () => {
				new createXoppFileModal(this.app, this)
					.setTitle("Create a new Xournal++ note")
					.open()
            }
        });

		this.addRibbonIcon('pen-tool', 'Create new Xournal++ note', (evt: MouseEvent) => {
			new createXoppFileModal(this.app, this)
				.setTitle("Create a new Xournal++ note")
				.open()
		});
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
			this.addACreateXournalppMenu(menu, file.path)
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

	addACreateXournalppMenu = (menu, pdfFile: TFile) => {
		menu.addItem(item => {
			item.setTitle('Create new Xournal++')
				.setIcon('pen-tool')
				.onClick(() => {
					annotatePdfInXournalpp(pdfFile, this.app)
				});
		});
	}

    onunload() {}
}
