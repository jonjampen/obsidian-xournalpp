import { ButtonComponent, TFile, Plugin, Notice } from 'obsidian';

export default class XoppPlugin extends Plugin {
    onload() {
		// on pdf file open
        this.registerEvent(
            this.app.workspace.on('file-open', (file) => {
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
							let xoppButton = new ButtonComponent(pdfToolbar)
							.setClass("clickable-icon")
							.setClass("xournalpp-open-icon")
							.setButtonText('Edit in Xournal++')
							.setIcon('pen-tool')
							.setTooltip('Open in Xournal++');

							xoppButton.onClick(() =>  {
								this.app.workspace.getLeaf().openFile(xoppFile)
								new Notice('Opening file in Xournal++');
							})

							pdfToolbar.appendChild(xoppButton.buttonEl);
						}
					}
                }
            })
        );
    }

    onunload() {}
}
