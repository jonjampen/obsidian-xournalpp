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
    openAfterCreate = false;

    constructor(
        app: App,
        plugin: XoppPlugin,
        filePath = "",
        editor: Editor | null = null,
        linksToInsert = ""
    ) {
        this.app = app;
        this.plugin = plugin;
        this.filePath = filePath;
        this.editor = editor;
        this.linksToInsert = linksToInsert;

        this.createModals();
    }

    createModals() {
        const templatesFolder = this.plugin.settings.templatesFolder?.trim();
        let templates: { path: string; name: string }[] = [];

        if (templatesFolder) {
            const templateFiles = this.app.vault
                .getFiles()
                .filter((f: TFile) => f.path.startsWith(templatesFolder + "/") && f.extension === "xopp");

            templates = templateFiles.map((file) => ({ path: file.path, name: file.name.replace(/\.xopp$/, "") }));
        }

        const onCloseFolderModal = (folderPath: string) =>
            new XoppFileNameModal(
                this.plugin.app,
                this.plugin,
                (fileName, templatePath) => this.onCreate(folderPath, fileName, templatePath),
                (fileName, templatePath) => this.onCreateAndOpen(folderPath, fileName, templatePath),
                templates,
                this.plugin.settings.defaultTemplatePath
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

    async onCreate(folderPath: string, fileName: string, templatePath?: string) {
        fileName += ".xopp";

        const newNotePath = folderPath === "/" ? fileName : `${folderPath}/${fileName}`;
        
        const selectedTemplatePath =
            templatePath && templatePath.length > 0
                ? templatePath
                : this.plugin.settings.defaultTemplatePath || undefined;

        await createXoppFile(this.plugin, newNotePath, selectedTemplatePath);

        if (this.editor instanceof Editor) {
            this.insertLink(this.editor, folderPath, fileName, this.linksToInsert);
        }
    }

    async onCreateAndOpen(folderPath: string, fileName: string, templatePath?: string) {
        await this.onCreate(folderPath, fileName, templatePath);
        const filePath = folderPath === "/" ? fileName : `${folderPath}/${fileName}`;
        const file = await this.waitForFileToBeIndexed(filePath + ".xopp");
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

        const xoppLink = "[[" + filePath + fileName + ".xopp" + "|" + fileName + "]]";
        const pdfLink = "[[" + filePath + fileName + ".pdf" + "|" + fileName + "]]";
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
