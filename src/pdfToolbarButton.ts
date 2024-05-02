import { ButtonComponent, TFile, Notice, App } from 'obsidian';
import { openXournalppFile } from './xoppActions';

export function createPdfToolbarButton(pdfToolbar: HTMLElement, xoppFile: TFile, app: App): void {
    let xoppButton = new ButtonComponent(pdfToolbar)
        .setClass("clickable-icon")
        .setClass("xournalpp-open-icon")
        .setButtonText('Edit in Xournal++')
        .setIcon('pen-tool')
        .setTooltip('Open in Xournal++');

        xoppButton.onClick(() =>  {
            openXournalppFile(xoppFile, app);
        })

        pdfToolbar.appendChild(xoppButton.buttonEl);
}