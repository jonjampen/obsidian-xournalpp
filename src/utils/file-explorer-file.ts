import XoppPlugin from "src/main";
import { findCorrespondingXoppToPdf, openXournalppFile } from "./xopp-actions";

interface FileExplorerView {
    containerEl?: HTMLElement;
    fileItems?: Record<string, { tagEl?: HTMLElement }>;
}

export function addOpenInXournalpp(plugin: XoppPlugin) {
    plugin.app.workspace.onLayoutReady(() => {
        observeFileExplorer(plugin); // Start observing once the layout is ready
        applyXournalppTags(plugin); // Apply the tags initially
    });
}

function observeFileExplorer(plugin: XoppPlugin) {
    const fileExplorers = plugin.app.workspace.getLeavesOfType("file-explorer");

    fileExplorers.forEach((fileExplorer) => {
        const view = fileExplorer.view as unknown as FileExplorerView;
        const container = view?.containerEl;

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
    const fileExplorers = plugin.app.workspace.getLeavesOfType("file-explorer");

    fileExplorers.forEach((fileExplorer) => {
        const view = fileExplorer.view as unknown as FileExplorerView;
        const allFiles = view?.fileItems;
        if (!allFiles) return;

        Object.entries(allFiles).forEach(([filePath, value]) => {
            if (filePath.endsWith(".pdf")) {
                const xoppFile = findCorrespondingXoppToPdf(filePath, plugin);
                if (xoppFile && value?.tagEl) {
                    const tagEl = value.tagEl;

                    if (tagEl.innerText !== "X++" || !tagEl.classList.contains("clickable-tag")) {
                        tagEl.innerText = "X++";
                        tagEl.classList.add("clickable-tag");
                        tagEl.onclick = () => {
                            void openXournalppFile(xoppFile, plugin);
                        };
                    }
                }
            }
        });
    });
}
