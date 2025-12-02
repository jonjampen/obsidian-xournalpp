import { Menu, TFile, TFolder } from "obsidian";
import { deleteXoppAndPdf, findCorrespondingXoppToPdf, openXournalppFile, renameXoppFile } from "./xoppActions";
import CreateXoppModalManager from "./CreateXoppModalManager";
import XoppPlugin from "main";
import { exportXoppToPDF } from "./xopp2pdf";
import RenameModal from "./modals/RenameModal";
import { createAnnotationFromPdf } from "./TemplateCreationModalManager";

export function addXournalppOptionsToFileMenu(menu: Menu, file: TFile | TFolder, plugin: XoppPlugin) {
    if (file instanceof TFile) {
        if (file.extension === "xopp") {
            addOpenInXournalppMenu(menu, file, plugin);
        } else if (file.extension === "pdf") {
			addAnnotatePdfInXournalppMenu(menu, plugin, file);
            const xoppFile = findCorrespondingXoppToPdf(file.path, plugin);
            if (xoppFile) {
                addOpenInXournalppMenu(menu, xoppFile, plugin);
                addXournalppRenameMenu(menu, file, xoppFile, plugin);
                addXournalppDeleteMenu(menu, file, xoppFile, plugin);
                removeDeleteRenameMenuItem();
            }
        }
    } else {
		if (file?.children) {
			addCreateXournalppMenu(menu, file, plugin);
		}
	}
}


function addAnnotatePdfInXournalppMenu(menu: Menu, plugin: XoppPlugin, file: TFile) {
	menu.addItem((item) => {
    item
        .setTitle("Annotate in Xournal++")
        .setIcon("pen-tool")
        .onClick(async () => {
            const xoppPath = await createAnnotationFromPdf(plugin, file);
        });
});
}

function addOpenInXournalppMenu(menu: Menu, xoppFile: TFile, plugin: XoppPlugin) {
    menu.addItem((item) => {
        item.setTitle("Open in Xournal++")
            .setIcon("pen-tool")
            .onClick(() => {
                openXournalppFile(xoppFile, plugin);
            });
    });
    menu.addItem((item) => {
        item.setTitle("Update from Xournal++")
            .setIcon("rotate-cw")
            .onClick(() => {
                let filePath = plugin.app.workspace.getActiveFile()?.path as string;
                filePath = filePath?.replace(".pdf", ".xopp");
                exportXoppToPDF(plugin, [filePath]);
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
                deleteXoppAndPdf(plugin, xoppFile, pdfFile);
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

    const renameFile = (fileName: string) => renameXoppFile(plugin, xoppFile, pdfFile, fileName);
}

function removeDeleteRenameMenuItem() {
    const body = document.querySelector("body");
    if (!body) return;

    const observer = new MutationObserver(() => {
        const menuItems = body.querySelectorAll(".menu-item");
        if (menuItems.length > 0) {
            let isXoppMenu = false;

            menuItems.forEach((item) => {
                if (item.textContent && item.textContent == "Delete PDF & Xournal++") {
                    item.classList.add("is-warning");
                    isXoppMenu = true;
                }
            });

            if (isXoppMenu) {
                menuItems.forEach((item) => {
                    if (item.textContent && (item.textContent == "Delete" || item.textContent == "Rename..."))
                        item.remove();
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
