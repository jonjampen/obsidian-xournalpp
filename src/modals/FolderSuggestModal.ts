import XoppPlugin from "main";
import { App, FuzzySuggestModal, TFolder } from "obsidian";

export default class FolderSuggestModal extends FuzzySuggestModal<TFolder> {
    plugin: XoppPlugin;
    onCloseModal: (folderPath: string) => void;

    constructor(app: App, plugin: XoppPlugin, onCloseFolderModal: (folderPath: string) => void) {
        super(app);
        this.plugin = plugin;
        this.onCloseModal = onCloseFolderModal;
    }

    getItems(): TFolder[] {
        let folders: TFolder[] = [];
        const folderPaths = new Set<string>();

        this.app.vault.getAllLoadedFiles().forEach((file) => {
            if (file instanceof TFolder) {
                const normalizedPath = file.path.startsWith("/") ? file.path.slice(0, 1) : file.path;
                if (!folderPaths.has(normalizedPath)) {
                    folders.push(file);
                    folderPaths.add(normalizedPath);
                }
            }
        });

        let defaultFolderPath = this.plugin.settings.defaultNewFilePath;
        if (defaultFolderPath.endsWith("/")) {
            defaultFolderPath = defaultFolderPath.slice(0, -1);
        }
        let defaultFolder = this.app.vault.getFolderByPath(defaultFolderPath);
        if (defaultFolder != null && this.inputEl.value == "") folders = [defaultFolder].concat(folders);
        return folders;
    }

    getItemText(folder: TFolder): string {
        return folder.path;
    }

    onOpen(): void {
        super.onOpen();

        this.inputEl.addEventListener("keydown", (event) => {
            if (event.key === "Tab") {
                event.preventDefault();
                let selectedElement = this.modalEl.getElementsByClassName("is-selected").item(0);
                let selected = selectedElement ? selectedElement.textContent : "";

                this.inputEl.value = selected || "";

                this.setContent("test");
                this.inputEl.dispatchEvent(new Event("input"));
            }
        });
    }

    onChooseItem(folder: TFolder): void {
        this.onCloseModal(folder.path);
    }
}
