import { Menu, TFile, TFolder } from "obsidian";
import { findCorrespondingXoppToPdf, openXournalppFile } from "./xoppActions";
import { createXoppFileModal } from "./modal";
import XoppPlugin from "main";

export function addXournalppOptionsToFileMenu(menu: Menu, file: TFile|TFolder, plugin: XoppPlugin) {
    if (file instanceof TFile) {
        if (file.extension === "xopp") {
            addOpenInXournalppMenu(menu, file, plugin);
        }
        else if (file.extension === "pdf") {
            let xoppFile = findCorrespondingXoppToPdf(file.path, plugin);
            if (xoppFile) {
                addOpenInXournalppMenu(menu, xoppFile, plugin);
            }
        }
    }
    else if (file instanceof TFolder) {
        if (file?.children) {
            addCreateXournalppMenu(menu, file, plugin);
        }
    }
}

function addOpenInXournalppMenu(menu: Menu, xoppFile: TFile, plugin: XoppPlugin) {
    menu.addItem(item => {
        item.setTitle('Open in Xournal++')
            .setIcon('pen-tool')
            .onClick(() => {
                openXournalppFile(xoppFile, plugin.app);
            });
    });
}

function addCreateXournalppMenu(menu: Menu, folder: TFolder, plugin: XoppPlugin) {
    menu.addItem(item => {
        item.setTitle('Create new Xournal++')
            .setIcon('pen-tool')
            .onClick(() => {
                new createXoppFileModal(plugin.app, plugin, folder?.path ?? "")
                    .setTitle("Create a new Xournal++ note")
                    .open();
            });
    });
}
