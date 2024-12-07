import { App, ButtonComponent, Modal, TextComponent } from "obsidian";

export default class RenameModal extends Modal {
    filePath: string;
    renameFile: (fileName: string) => void;

    constructor(app: App, filePath: string, renameFile: (fileName: string) => void) {
        super(app);
        this.filePath = filePath;
        this.renameFile = renameFile;
    }

    onOpen() {
        const { contentEl } = this;

        const container = contentEl.createDiv({ cls: "new-file-modal-form" });

        let fileName: string;
        let prev = this.filePath.split("/");
        let fullFileName = prev[prev.length - 1];
        fileName = fullFileName.split(".")[0];

        const textComponent = new TextComponent(container)
            .setPlaceholder("Enter a new file name")
            .setValue(fileName)
            .onChange((i) => {
                fileName = i;
            });

        textComponent.inputEl.focus();

        textComponent.inputEl.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.renameFile(fileName);
                this.close();
            }
        });

        new ButtonComponent(container).setButtonText("Create").onClick(() => {
            this.renameFile(fileName);
            this.close();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
