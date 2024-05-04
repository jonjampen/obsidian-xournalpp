    import XoppPlugin from "main";
    import { findCorrespondingXoppToPdf, openXournalppFile } from "./xoppActions";

    export function addOpenInXournalpp(plugin: XoppPlugin) {
        let fileExplorers = plugin.app.workspace.getLeavesOfType("file-explorer");

        fileExplorers.forEach(fileExplorer => {
            let files = (fileExplorer.view as any)?.navFileContainerEl.querySelectorAll(".nav-file-title") as NodeListOf<HTMLElement>;
            files.forEach((file: HTMLElement) => {
                let xoppFile = findCorrespondingXoppToPdf(file.dataset.path as string, plugin);

                if (xoppFile && file.dataset.path?.includes("pdf")) {
                    let div = file.querySelector('.nav-file-tag') as HTMLElement;
                    if (!div) return 

                    div.innerText = "X++";
                    div.style.setProperty("cursor", "pointer");
                    div.onclick = () => {
                        openXournalppFile(xoppFile, plugin.app);
                    }                                
                }
            })
        })
    }