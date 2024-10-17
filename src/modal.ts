import { App, ButtonComponent, Editor, FileSystemAdapter, Modal, Setting, TextComponent } from "obsidian";
import { createXoppFile } from "./xoppActions";
import XoppPlugin from "main";

export class createXoppFileModal extends Modal {
    plugin: XoppPlugin;
    filePath: string;
    editor: Editor | null;
    linksToInsert: string;
    
    constructor(app: App, plugin: XoppPlugin, filePath: string = "", editor: Editor | null = null, linksToInsert: string = "") {
        super(app);
        this.plugin = plugin as XoppPlugin;
        this.filePath = filePath ? filePath + "/" : "";
        this.editor = editor;
        this.linksToInsert = linksToInsert;
    }

    onOpen() {
        const { contentEl } = this;
        let filePath = this.filePath;

        let container = contentEl.createDiv({ cls: 'new-file-modal-form' });

        new TextComponent(container)
            .setPlaceholder("Folder path")
            .onChange((i) => {
                filePath = i;
            })
            .inputEl.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    this.insertFileName(container, filePath);
                }
            });

        new ButtonComponent(container)
            .setButtonText("Next")
            .onClick(() => {
                this.insertFileName(container, filePath);
            });

    }

    insertFileName(container: HTMLDivElement, filePath: string) {
        container.empty();

        let fileName: string;

        new TextComponent(container)
            .setPlaceholder("File name")
            .onChange((i) => {
                fileName = i;
            })
            .inputEl.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    this.submitInput(filePath, fileName);
                }
            });

        new ButtonComponent(container)
            .setButtonText("Create")
            .onClick(() => {
                this.submitInput(filePath, fileName);
            });
    }

    submitInput(filePath: string, fileName: string) {
        fileName += ".xopp";

        createXoppFile(this.plugin, filePath === "" ? fileName : `${filePath}/${fileName}`);
        this.close();

        this.insertLink(filePath, fileName);
    }

    insertLink(filePath: string, fileName: string) {
        if (!this.editor) {
            return;
        }

        const defaultNewFilePath = this.plugin.settings.defaultNewFilePath;

        if (filePath !== "") filePath = filePath + "/";
        else filePath = defaultNewFilePath ? defaultNewFilePath + "/" : "/";

        fileName = fileName.replace(".xopp", "");
        
        let xoppLink = "[[" + filePath + fileName + ".xopp" + "|" + fileName + "]]";
        let pdfLink = "[[" + filePath + fileName + ".pdf" + "|" + fileName + "]]";
        let finalLink = xoppLink + " " + pdfLink;

        if (this.linksToInsert === "embeddedPDF") finalLink = "!" + pdfLink;
        if (this.linksToInsert === "PDF") finalLink = pdfLink;
        if (this.linksToInsert === "XOPP") finalLink = xoppLink;

        this.editor.replaceRange(finalLink, this.editor.getCursor());
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}