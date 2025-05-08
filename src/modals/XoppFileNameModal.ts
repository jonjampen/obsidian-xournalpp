import { App, ButtonComponent, Editor, Modal, TextComponent } from "obsidian";

export default class XoppFileNameModal extends Modal {
    editor: Editor | null;
    createFile: (fileName: string) => void;
    createAndOpenFile: (fileName: string) => void;

    constructor(app: App, createFile: (fileName: string) => void, createAndOpenFile: (fileName: string) => void) {
        super(app);
        this.createFile = createFile;
        this.createAndOpenFile = createAndOpenFile;
    }

    onOpen() {
        const { contentEl } = this;

        const container = contentEl.createDiv({ cls: "new-xopp-file-modal-form" });

        let fileName: string;

        const textComponent = new TextComponent(container).setPlaceholder("Enter a file name").onChange((i) => {
            fileName = i;
        });

        textComponent.inputEl.focus();

        textComponent.inputEl.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                if (e.shiftKey) {
                    this.createAndOpenFile(fileName);
                    this.close();
                } else {
                    this.createFile(fileName);
                    this.close();
                }
            }
        });

        const buttonRow = container.createDiv({ cls: "button-row" });

        new ButtonComponent(buttonRow)
            .setButtonText("Create")
            .setTooltip("Enter")
            .onClick(() => {
                this.createFile(fileName);
                this.close();
            });

        new ButtonComponent(buttonRow)
            .setButtonText("Create & Open")
            .setTooltip("Shift + Enter")
            .onClick(() => {
                this.createAndOpenFile(fileName);
                this.close();
            });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
