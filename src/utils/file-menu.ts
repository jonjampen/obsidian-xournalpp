import { Menu, TFile, TFolder } from "obsidian";
import { deleteXoppAndPdf, findCorrespondingXoppToPdf, openXournalppFile, renameXoppFile } from "./xopp-actions";
import CreateXoppModalManager from "src/ui/managers/create-xopp-modal-manager";
import XoppPlugin from "src/main";
import { exportXoppToPDF } from "./xopp-to-pdf";
import RenameModal from "../ui/modals/rename-modal";

export function addXournalppOptionsToFileMenu(menu: Menu, file: TFile | TFolder, plugin: XoppPlugin) {
    if (file instanceof TFile) {
        if (file.extension === "xopp") {
            addOpenInXournalppMenu(menu, file, plugin);
        } else if (file.extension === "pdf") {
            const xoppFile = findCorrespondingXoppToPdf(file.path, plugin);
            if (xoppFile) {
                addOpenInXournalppMenu(menu, xoppFile, plugin);
                addXournalppRenameMenu(menu, file, xoppFile, plugin);
                addXournalppDeleteMenu(menu, file, xoppFile, plugin);
                removeDeleteRenameMenuItem();
            }
        }
    } else if (file instanceof TFolder) {
        if (file?.children) {
            addCreateXournalppMenu(menu, file, plugin);
        }
    }
}

function addOpenInXournalppMenu(menu: Menu, xoppFile: TFile, plugin: XoppPlugin) {
    menu.addItem((item) => {
        item.setTitle("Open in Xournal++")
            .setIcon("pen-tool")
            .onClick(() => {
                void openXournalppFile(xoppFile, plugin);
            });
    });
    menu.addItem((item) => {
        item.setTitle("Update from Xournal++")
            .setIcon("rotate-cw")
            .onClick(() => {
                let filePath = plugin.app.workspace.getActiveFile()?.path as string;
                filePath = filePath?.replace(".pdf", ".xopp");
                void exportXoppToPDF(plugin, [filePath]);
            });
    });
}

function addCreateXournalppMenu(menu: Menu, folder: TFolder, plugin: XoppPlugin) {
    menu.addItem((item) => {
        item.setTitle("Create new Xournal++")
            .setIcon("pen-tool")
            .onClick(() => {
                new CreateXoppModalManager(plugin.app, plugin, folder?.path ?? "");
            });
    });
}

function addXournalppDeleteMenu(menu: Menu, pdfFile: TFile, xoppFile: TFile, plugin: XoppPlugin) {
    menu.addItem((item) => {
        item.setTitle("Delete PDF & Xournal++")
            .setIcon("trash")
            .setSection("danger")
            .onClick(() => {
                void deleteXoppAndPdf(plugin, xoppFile, pdfFile);
            });
    });
}

function addXournalppRenameMenu(menu: Menu, pdfFile: TFile, xoppFile: TFile, plugin: XoppPlugin) {
    menu.addItem((item) => {
        item.setTitle("Rename PDF & Xournal++...")
            .setIcon("pencil")
            .setSection("danger")
            .onClick(() => {
                new RenameModal(plugin.app, xoppFile.path, renameFile).open();
            });
    });

    const renameFile = (fileName: string) => {
        void renameXoppFile(plugin, xoppFile, pdfFile, fileName);
    };
}

function removeDeleteRenameMenuItem() {
    const body = document.querySelector("body");
    if (!body) return;

    const observer = new MutationObserver(() => {
        const menuItems = body.querySelectorAll(".menu-item");
        if (menuItems.length > 0) {
            let isXoppMenu = false;

            menuItems.forEach((item) => {
                if (item.textContent && item.textContent === "Delete PDF & Xournal++") {
                    item.classList.add("is-warning");
                    isXoppMenu = true;
                }
            });

            if (isXoppMenu) {
                menuItems.forEach((item) => {
                    if (item.textContent && (item.textContent === "Delete" || item.textContent === "Rename...")) {
                        item.remove();
                    }
                });
            }

            observer.disconnect();
        }
    });

    observer.observe(body, {
        childList: true,
        subtree: true,
    });
}
