import { App, ButtonComponent, Editor, Modal, Setting, TextComponent } from "obsidian";
import { createXoppFile } from "./xoppActions";
import XoppPlugin from "main";

export class createXoppFileModal extends Modal {
    plugin: XoppPlugin;
    filePath: string;
    editor: Editor|null;
    linksToInsert: string;

    constructor(app: App, plugin: XoppPlugin, path: string = "", editor: Editor|null = null, linksToInsert: string = "") {
        super(app);
        this.plugin = plugin as XoppPlugin;
        this.filePath = path ? path + "/" : "";
        this.editor = editor;
        this.linksToInsert = linksToInsert;
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

        this.insertLink(path);
    }

    insertLink(path: string) {
        if (!this.editor) return;

        let fileName = path.split("/")[path.split("/").length -1]

        let xoppLink = "[[" + path + "|" + fileName + "]]";
        let pdfLink = "[[" + path.replace(".xopp", ".pdf") + "|" + fileName.replace(".xopp", ".pdf") + "]]";
        let finalLink = xoppLink + " " + pdfLink;

        console.log(this.linksToInsert)
        
        if (this.linksToInsert === "PDF") finalLink = pdfLink;
        if (this.linksToInsert === "XOPP") finalLink = xoppLink;

        this.editor.replaceRange(finalLink, this.editor.getCursor());
    }
    
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
