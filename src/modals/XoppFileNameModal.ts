import { App, ButtonComponent, Editor, Modal, TextComponent } from "obsidian";

export default class XoppFileNameModal extends Modal {
    editor: Editor | null;
    createFile: (fileName: string) => void;

    constructor(app: App, createFile: (fileName: string) => void) {
        super(app);
        this.createFile = createFile;
    }

    onOpen() {
        const { contentEl } = this;

        const container = contentEl.createDiv({ cls: "new-file-modal-form" });

        let fileName: string;

        const textComponent = new TextComponent(container).setPlaceholder("Enter a file name").onChange((i) => {
            fileName = i;
        });

        textComponent.inputEl.focus();

        textComponent.inputEl.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.createFile(fileName);
                this.close();
            }
        });

        new ButtonComponent(container).setButtonText("Create").onClick(() => {
            this.createFile(fileName);
            this.close();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
