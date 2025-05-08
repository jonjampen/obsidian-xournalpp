import { App, Editor, Notice, TFile } from "obsidian";
import { createXoppFile, openXournalppFile } from "./xoppActions";
import XoppPlugin from "main";
import XoppFileNameModal from "./modals/XoppFileNameModal";
import FolderSuggestModal from "./modals/FolderSuggestModal";

export default class CreateXoppModalManager {
    app: App;
    plugin: XoppPlugin;
    filePath: string;
    editor: Editor | null;
    linksToInsert: string;
    openAfterCreate: boolean = false;

    constructor(
        app: App,
        plugin: XoppPlugin,
        filePath: string = "",
        editor: Editor | null = null,
        linksToInsert: string = ""
    ) {
        this.app = app;
        this.plugin = plugin;
        this.filePath = filePath;
        this.editor = editor;
        this.linksToInsert = linksToInsert;

        this.createModals();
    }

    createModals() {
        const onCloseFolderModal = (folderPath: string) =>
            new XoppFileNameModal(
                this.plugin.app,
                (fileName) => this.onCreate(folderPath, fileName),
                (fileName) => this.onCreateAndOpen(folderPath, fileName)
            )
                .setTitle("Create a new Xournal++ note")
                .open();

        const folderSuggestModal = new FolderSuggestModal(this.app, this.plugin, onCloseFolderModal);
        folderSuggestModal.setPlaceholder("Select a folder for the new Xournal++ note");
        folderSuggestModal.setInstructions([
            { command: "Arrows", purpose: "to navigate" },
            { command: "Tab", purpose: "to autocomplete folder" },
            { command: "Enter", purpose: "to select folder" },
        ]);

        if (this.filePath == "") {
            folderSuggestModal.open();
        } else {
            onCloseFolderModal(this.filePath);
        }
    }

    async onCreate(folderPath: string, fileName: string) {
        fileName += ".xopp";
        await createXoppFile(this.plugin, folderPath === "/" ? fileName : `${folderPath}/${fileName}`);

        if (this.editor instanceof Editor) this.insertLink(this.editor, folderPath, fileName, this.linksToInsert);
    }

    async onCreateAndOpen(folderPath: string, fileName: string) {
        await this.onCreate(folderPath, fileName);
        const file = await this.waitForFileToBeIndexed(folderPath + "/" + fileName + ".xopp");
        if (file) {
            openXournalppFile(file, this.plugin);
        } else {
            console.error("Failed to open the file after creation.");
            new Notice("Failed to open the file after creation.");
        }
    }

    insertLink(editor: Editor, filePath: string, fileName: string, linksToInsert: string) {
        if (filePath !== "/") filePath = filePath + "/";

        fileName = fileName.replace(".xopp", "");

        let xoppLink = "[[" + filePath + fileName + ".xopp" + "|" + fileName + "]]";
        let pdfLink = "[[" + filePath + fileName + ".pdf" + "|" + fileName + "]]";
        let finalLink = xoppLink + " " + pdfLink;

        if (linksToInsert === "embeddedPDF") finalLink = "!" + pdfLink;
        if (linksToInsert === "PDF") finalLink = pdfLink;
        if (linksToInsert === "XOPP") finalLink = xoppLink;

        editor.replaceRange(finalLink, editor.getCursor());
    }

    async waitForFileToBeIndexed(path: string, timeout = 5000): Promise<TFile | null> {
        const interval = 100;
        const maxAttempts = timeout / interval;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const file = this.plugin.app.vault.getFileByPath(path);
            if (file) return file;
            await new Promise((resolve) => setTimeout(resolve, interval));
        }
        return null;
    }
}
