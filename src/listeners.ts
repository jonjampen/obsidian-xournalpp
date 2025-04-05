import XoppPlugin from "main";
import { addXournalppOptionsToFileMenu } from "./fileMenu";
import { Menu, TFile, TFolder } from "obsidian";
import { addOpenInXournalppToPdfToolbar } from "./pdfToolbar";
import { addCreateXournalppNavIcon } from "./fileExplorerNav";
import { addOpenInXournalpp } from "./fileExplorerFile";
import { exportXoppToPDF } from "./xopp2pdf";

export function setupListeners(plugin: XoppPlugin) {

    // on startup
    plugin.registerEvent(plugin.app.workspace.on("layout-change", () => {
        addCreateXournalppNavIcon(plugin);
        addOpenInXournalpp(plugin);
    }));
    
    plugin.registerEvent(plugin.app.workspace.on("file-open", (file: TFile) => {
        addOpenInXournalppToPdfToolbar(file, plugin);
    }));
    plugin.registerEvent(plugin.app.workspace.on("file-menu", (menu: Menu, file: TFile|TFolder) => {
        addXournalppOptionsToFileMenu(menu, file, plugin);
    }));
    plugin.registerEvent(plugin.app.workspace.on("active-leaf-change", (leaf) => {
        if (leaf?.getDisplayText() === "Files") {
            addCreateXournalppNavIcon(plugin);
            addOpenInXournalpp(plugin);
        }
    }));

    plugin.registerEvent(plugin.app.vault.on("modify", (file: TFile) => {
        if (file.extension === "xopp" && plugin.settings.autoExport) exportXoppToPDF(plugin, [file.path], false)
    }))
    plugin.app.workspace.onLayoutReady(() => {
    initialLoad(plugin);
    plugin.registerEvent(plugin.app.vault.on("create", (file: TFile) => {
        if (file.extension === "xopp" && plugin.settings.autoExport) exportXoppToPDF(plugin, [file.path], false)
    }))
    });
}

function initialLoad(plugin: XoppPlugin) {
    if (plugin.settings.autoExport) {
        let files = plugin.app.vault.getFiles();
        let xopp_files = files.filter(file => file.extension === "xopp");
        let pdf_files = files.filter(file => file.extension === "pdf");

        let filePaths = [];
        for (const xopp_file of xopp_files) {
                let pdf_file = pdf_files.find(pdf => pdf.path === xopp_file.path.replace(".xopp", ".pdf")) || false;
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
            exportXoppToPDF(plugin, filePaths, false);
        }
    }
    
    addCreateXournalppNavIcon(plugin);
    addOpenInXournalpp(plugin);

}
