import XoppPlugin from "main";
import { findCorrespondingXoppToPdf, openXournalppFile } from "./xoppActions";

export function addOpenInXournalpp(plugin: XoppPlugin) {
    plugin.app.workspace.onLayoutReady(() => {
        observeFileExplorer(plugin); // Start observing once the layout is ready
        applyXournalppTags(plugin); // Apply the tags initially
    });
}

function observeFileExplorer(plugin: XoppPlugin) {
    let fileExplorers = plugin.app.workspace.getLeavesOfType("file-explorer");

    fileExplorers.forEach((fileExplorer) => {
        let container = (fileExplorer.view as any)?.containerEl;

        if (container) {
            // Observe changes in the file explorer DOM
            const observer = new MutationObserver(() => {
                applyXournalppTags(plugin); // Reapply tags whenever there's a DOM change
            });

            // Observe changes to child elements (subtree and childList options)
            observer.observe(container, { childList: true, subtree: true });
        }
    });
}

function applyXournalppTags(plugin: XoppPlugin) {
    let fileExplorers = plugin.app.workspace.getLeavesOfType("file-explorer");

    fileExplorers.forEach((fileExplorer) => {
        let allFiles: { [key: string]: { tagEl: HTMLElement } } = (fileExplorer.view as any)?.fileItems;
        if (!allFiles) return;

        Object.entries(allFiles).forEach(([filePath, value]) => {
            if (filePath.endsWith(".pdf")) {
                let xoppFile = findCorrespondingXoppToPdf(filePath, plugin);
                if (xoppFile && value?.tagEl) {
                    const tagEl = value.tagEl as HTMLElement;

                    if (tagEl && (tagEl.innerText != "X++" || !tagEl.classList.contains("clickable-tag"))) {
                        tagEl.innerText = "X++";
                        tagEl.classList.add("clickable-tag");
                        tagEl.onclick = () => {
                            openXournalppFile(xoppFile, plugin);
                        };
                    }
                }
            }
        });
    });
}
