import { App, Modal, Setting } from "obsidian";
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

        new Setting(contentEl)
        .setName("File name")
        .addText((input) => {
            input.onChange((i) => fileName = i)
        })

        new Setting(contentEl)
        .addButton(button => {
            button
                .setButtonText("Create")
                .onClick(() => {
                    fileName += ".xopp";

                    createXoppFile(this.plugin, this.filePath + fileName)
                    this.close();
                })
        })
    }
    
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
