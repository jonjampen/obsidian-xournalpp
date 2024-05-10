import XoppPlugin from "main";
import { MarkdownView, TFile, getLinkpath } from "obsidian";
import { findCorrespondingXoppToPdf } from "./xoppActions";
import { ButtonComponent, App } from 'obsidian';
import { openXournalppFile } from './xoppActions';

export function addOpenInXournalppToPdfToolbar(file: TFile, plugin: XoppPlugin) {
    if (file && file.extension === "pdf") {
        // reset icon
        const oldIcons = document.querySelectorAll('.xournalpp-open-icon');
        oldIcons.forEach((old) => old.remove())

        let xoppFile = findCorrespondingXoppToPdf(file.path, plugin)

        if (xoppFile) {
            // show toolbar icon
            const pdfToolbar = document.querySelector('.pdf-toolbar-right') as HTMLElement;

            if (pdfToolbar) {
                createPdfToolbarButton(pdfToolbar, xoppFile, plugin.app)
            }
        }
    }
}


export function createPdfToolbarButton(pdfToolbar: HTMLElement, xoppFile: TFile, app: App): void {
    let xoppButton = new ButtonComponent(pdfToolbar)
        .setClass("clickable-icon")
        .setClass("xournalpp-open-icon")
        .setButtonText('Edit in Xournal++')
        .setIcon('pen-tool')
        .setTooltip('Edit in Xournal++');

        xoppButton.onClick(() =>  {
            openXournalppFile(xoppFile, app);
        })

        pdfToolbar.appendChild(xoppButton.buttonEl);
}