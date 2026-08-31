import XoppPlugin from "../main";
import { addXournalppOptionsToFileMenu } from "../utils/file-menu";
import { Menu, TFile, TFolder } from "obsidian";
import { addOpenInXournalppToPdfToolbar } from "../utils/pdf-toolbar";
import { addCreateXournalppNavIcon } from "../utils/file-explorer-nav";
import { addOpenInXournalpp } from "../utils/file-explorer-file";
import { exportXoppToPDF } from "../utils/xopp-to-pdf";

export function setupListeners(plugin: XoppPlugin) {
    // on startup
    plugin.registerEvent(
        plugin.app.workspace.on("layout-change", () => {
            addCreateXournalppNavIcon(plugin);
            addOpenInXournalpp(plugin);
        })
    );

    plugin.registerEvent(
        plugin.app.workspace.on("file-open", (file: TFile) => {
            addOpenInXournalppToPdfToolbar(file, plugin);
        })
    );
    plugin.registerEvent(
        plugin.app.workspace.on("file-menu", (menu: Menu, file: TFile | TFolder) => {
            addXournalppOptionsToFileMenu(menu, file, plugin);
        })
    );
    plugin.registerEvent(
        plugin.app.workspace.on("active-leaf-change", (leaf) => {
            if (leaf?.getDisplayText() === "Files") {
                addCreateXournalppNavIcon(plugin);
                addOpenInXournalpp(plugin);
            }
        })
    );

    const exportDebounceTimers = new Map<string, number>();

    const debouncedExport = (filePath: string) => {
        const existing = exportDebounceTimers.get(filePath);
        if (existing) window.clearTimeout(existing);
        exportDebounceTimers.set(
            filePath,
            window.setTimeout(() => {
                exportDebounceTimers.delete(filePath);
                void exportXoppToPDF(plugin, [filePath], false);
            }, 1000)
        );
    };

    plugin.registerEvent(
        plugin.app.vault.on("modify", (file: TFile) => {
            if (file.extension === "xopp" && plugin.settings.autoExport) {
                debouncedExport(file.path);
            }
        })
    );
    plugin.app.workspace.onLayoutReady(() => {
        initialLoad(plugin);
        plugin.registerEvent(
            plugin.app.vault.on("create", (file: TFile) => {
                if (file.extension === "xopp" && plugin.settings.autoExport) {
                    debouncedExport(file.path);
                }
            })
        );
    });
}

function initialLoad(plugin: XoppPlugin) {
    if (plugin.settings.autoExport) {
        const files = plugin.app.vault.getFiles();
        const xopp_files = files.filter((file) => file.extension === "xopp");
        const pdf_files = files.filter((file) => file.extension === "pdf");

        const filePaths = [];
        for (const xopp_file of xopp_files) {
            const pdf_file = pdf_files.find((pdf) => pdf.path === xopp_file.path.replace(".xopp", ".pdf")) || false;
            let xopp_is_newer = false;
            if (pdf_file) {
                xopp_is_newer = xopp_file.stat.mtime > pdf_file.stat.mtime;
            }
            // Add the file path to the list if PDF doesn't exist or XOPP is newer
            if (!pdf_file || xopp_is_newer) {
                filePaths.push(xopp_file.path);
            }
        }

        if (filePaths.length > 0) {
            void exportXoppToPDF(plugin, filePaths, false);
        }
    }

    addCreateXournalppNavIcon(plugin);
    addOpenInXournalpp(plugin);
}
