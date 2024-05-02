import { TFile, Plugin } from 'obsidian';
import { createPdfToolbarButton } from 'src/pdfToolbarButton';

export default class XoppPlugin extends Plugin {
    onload() {
		// on pdf file open
        this.registerEvent(
            this.app.workspace.on('file-open', this.onFileOpen)
        );
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

    onunload() {}
}
