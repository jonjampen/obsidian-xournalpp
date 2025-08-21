import { App, Modal } from "obsidian";

export class NewFilePlacholderHelpModal extends Modal {
    newFilePlaceholders: { title: string; placeholders: { pattern: string; example: string; description: string }[] }[];

    constructor(
        app: App,
        newFilePlaceholders: {
            title: string;
            placeholders: { pattern: string; example: string; description: string }[];
        }[]
    ) {
        super(app);
        this.newFilePlaceholders = newFilePlaceholders;
    }

    onOpen() {
        const { contentEl, modalEl } = this;
        modalEl.style.width = "1000px";

        contentEl.createEl("h2", { text: "Supported Placeholders" });

        this.newFilePlaceholders.forEach((group) => {
            contentEl.createEl("h3", { text: group.title });
            const table = contentEl.createEl("table", { cls: "xopp-placeholder-table" });

            const headerRow = table.createEl("tr");
            ["Placeholder", "Example", "Description"].forEach((title) => {
                headerRow.createEl("th", { text: title });
            });

            group.placeholders.forEach((s) => {
                const row = table.createEl("tr");
                row.createEl("td", { text: s.pattern });
                row.createEl("td", { text: s.example });
                row.createEl("td", { text: s.description });
            });
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
