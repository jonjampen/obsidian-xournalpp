import XoppPlugin from "main";
import { ButtonComponent, TFile } from "obsidian";
import { findCorrespondingXoppToPdf, openXournalppFile } from "./xoppActions";

export function addOpenInXournalppToPdfToolbar(file: TFile, plugin: XoppPlugin) {
    if (file && file.extension === "pdf") {
        // reset icon
        const oldIcons = document.querySelectorAll(".xournalpp-open-icon");
        oldIcons.forEach((old) => old.remove());

        const xoppFile = findCorrespondingXoppToPdf(file.path, plugin);

        if (xoppFile) {
            // show toolbar icon
            const pdfToolbar = document.querySelector(".pdf-toolbar-right") as HTMLElement;

            if (pdfToolbar) {
                createPdfToolbarButton(pdfToolbar, xoppFile, plugin);
            }
        }
    }
}

export function createPdfToolbarButton(pdfToolbar: HTMLElement, xoppFile: TFile, plugin: XoppPlugin): void {
    const xoppButton = new ButtonComponent(pdfToolbar)
        .setClass("clickable-icon")
        .setClass("xournalpp-open-icon")
        .setButtonText("Edit in Xournal++")
        .setIcon("pen-tool")
        .setTooltip("Edit in Xournal++");

    xoppButton.onClick(() => {
        openXournalppFile(xoppFile, plugin);
    });

    pdfToolbar.appendChild(xoppButton.buttonEl);
}
