import { App, ButtonComponent, Modal, Setting, TextComponent } from "obsidian";
import { createXoppFile } from "./xoppActions";
import XoppPlugin from "main";

export class createXoppFileModal extends Modal {
    plugin: XoppPlugin;
    filePath: string;

    constructor(app: App, plugin: XoppPlugin, path: string = "") {
        super(app);
        this.plugin = plugin as XoppPlugin;
        this.filePath = path ? path + "/" : "";
    }

    onOpen() {
        const { contentEl } = this;
        let fileName: string;

        let container = contentEl.createDiv({cls: 'new-file-modal-form'})

        new TextComponent(container)
            .setPlaceholder("File name")
            .onChange((i) => fileName = i)
            .inputEl.addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.submitInput(fileName)
            })

        new ButtonComponent(container)
            .setButtonText("Create")
            .onClick(() => {
                this.submitInput(fileName);
            })

    }
        
    
    submitInput(path: string) {
        path += ".xopp";

        createXoppFile(this.plugin, this.filePath + path)
        this.close();
    }
    
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
