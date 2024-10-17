import { App, ButtonComponent, Editor, FileSystemAdapter, Modal, Setting, TextComponent } from "obsidian";
import { createXoppFile } from "./xoppActions";
import XoppPlugin from "main";

export class createXoppFileModal extends Modal {
    plugin: XoppPlugin;
    filePath: string;
    editor: Editor | null;
    linksToInsert: string;
    folderFlag: boolean;

    constructor(app: App, plugin: XoppPlugin, filePath: string = "", editor: Editor | null = null, linksToInsert: string = "", folderFlag: boolean = false) {
        super(app);
        this.plugin = plugin as XoppPlugin;
        this.filePath = filePath ? filePath + "/" : "";
        this.editor = editor;
        this.linksToInsert = linksToInsert;
        this.folderFlag = folderFlag;
    }

    onOpen() {
        const { contentEl } = this;
        let folderFlag = this.folderFlag;
        let filePath = this.filePath;

        let container = contentEl.createDiv({ cls: 'new-file-modal-form' });

        if (folderFlag) {
            // Prompt for folder path if create in a specific folder is called
            new TextComponent(container)
                .setPlaceholder("Folder path")
                .onChange((i) => {
                    filePath = i;
                    console.log("Folder path set to:", filePath);
                })
                .inputEl.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") {
                        console.log("Enter key pressed for folder path");
                        this.insertFileName(container, filePath);
                    }
                });

            new ButtonComponent(container)
                .setButtonText("Next")
                .onClick(() => {
                    console.log("Next button clicked for folder path");
                    this.insertFileName(container, filePath);
                });
        } else {
            // Prompt for file name directly if create in default folder is called
            this.insertFileName(container, filePath);
        }
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

        createXoppFile(this.plugin, `${filePath}/${fileName}`);
        this.close();

        this.insertLink(filePath, fileName);
    }

    insertLink(filePath: string, fileName: string) {
        if (!this.editor) return;

        if (filePath === "") filePath = fileName;

        fileName = fileName.replace(".xopp", "");
        
        let xoppLink = "[[" + filePath + "|" + fileName + "]]";
        let pdfLink = "[[" + filePath.replace(".xopp", ".pdf") + "|" + fileName + "]]";
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