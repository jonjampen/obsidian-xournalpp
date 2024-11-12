import { App, Editor } from "obsidian";
import { createXoppFile } from "./xoppActions";
import XoppPlugin from "main";
import XoppFileNameModal from "./modals/XoppFileNameModal";
import FolderSuggestModal from "./modals/FolderSuggestModal";

export default class CreateXoppModalManager {
    app: App;
    plugin: XoppPlugin;
    filePath: string;
    editor: Editor | null;
    linksToInsert: string;

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
            new XoppFileNameModal(this.plugin.app, (fileName) => this.onCreate(folderPath, fileName))
                .setTitle("Create a new Xournal++ note")
                .open();

        const folderSuggestModal = new FolderSuggestModal(this.app, this.plugin, onCloseFolderModal);
        folderSuggestModal.setPlaceholder("Select a folder for the new Xournal++ note");
        folderSuggestModal.setInstructions([
            { command: "Arrows", purpose: "to navigate" },
            { command: "Tab", purpose: "to autocomplete folder" },
            { command: "Enter", purpose: "to select folder" },
        ]);
        folderSuggestModal.open();
    }

    onCreate(folderPath: string, fileName: string) {
        fileName += ".xopp";
        createXoppFile(this.plugin, folderPath === "" ? fileName : `${folderPath}/${fileName}`);

        if (this.editor instanceof Editor) this.insertLink(this.editor, folderPath, fileName, this.linksToInsert);
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
}
